/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	USER_AUTH: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;

	AI: any; // TBD: Workers AI Type
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// console.log('Logging: ', request.url);
		const randomResponseMap: { [key: string]: string } = {
			'0': 'Built with Cloudflare Workers (Response #1)',
			'1': 'Hello World (Response #2)',
			'2': 'Welcome to Code club! (Response #3)',
			'3': 'Random Responses (Response #4)',
		};
		let resp: any = new Response();
		const requestURL = new URL(request.url);
		switch (requestURL.pathname) {
			case '/profile':
				switch (request.method) {
					case 'GET':
						console.log('GET /profile');
					case 'POST':
						console.log('POST /profile');
						console.log('Currently both GET and POST have the same response handler.');
						resp = await handleProfileEndpoint(request, env);
						break;
					default:
						break;
				}
				break;
			case '/poems':
				switch (request.method) {
					case 'GET':
						console.log('GET /poems');
					case 'POST':
						console.log('POST /poems');
						resp = await handlePoemsEndpoint(request, env, ctx);
						break;
					default:
						break;
				}
				break;
			default:
				switch (request.method) {
					case 'POST':
						const newResponse = Response.json(
							{ message: 'Successful POST', foo: 'bar' },
							{ status: 201, statusText: 'Created', headers: { 'Content-Type': 'application/json' } }
						);
						resp = newResponse;
						break;
					case 'GET':
						// @ts-ignore
						const cfObj: IncomingRequestCfProperties = request.cf;
						const botM: IncomingRequestCfPropertiesBotManagementBase = cfObj.botManagement;
						const botScore = botM?.score;
						if (botScore < 30) {
							resp = await await fetch('https://k8s.benjamintran.com');
						} else {
							resp = await fetch('https://www.benjamintran.com');
						}
						break;
					default:
						const key = getRandomIntString(4);
						return new Response(randomResponseMap[key], { status: 200, statusText: 'OK' });
				}
		}
		return resp;
	},
};

function getRandomIntString(max: number): string {
	return Math.floor(Math.random() * max).toString();
}

async function handleProfileEndpoint(req: Request, env: Env): Promise<Response> {
	const userId = req.headers.get('UserID') || '';
	const authToken = await env.USER_AUTH.get(userId);
	let resp: any = new Response();
	if (!authToken) {
		const err = new Error(`Unable to fetch auth token for UserID: ${userId}`);
		resp = new Response(err.message, { status: 404 });
	}
	console.log(`Auth-Token: ${authToken}`);
	const newReq = new Request('https://benjamintran.com');
	newReq.headers.set('Auth-Token', authToken as string);

	// Base64 token
	const base64Token = btoa(authToken as string);
	newReq.headers.set('Auth-Token-Base-64', base64Token);

	// SHA-256
	const encoder = new TextEncoder();
	const encodedToken = encoder.encode(authToken as string);
	const hash = await crypto.subtle.digest({ name: 'SHA-256' }, encodedToken);
	const byteArray = new Uint8Array(hash);
	// const hashString = String.fromCharCode.apply(null, [...new Uint8Array(hash)]);
	let hashString = '';
	for (var i = 0; i < byteArray.byteLength; i++) {
		hashString += String.fromCodePoint(byteArray[i]);
	}
	console.log(`HashString: ${hashString}`);
	newReq.headers.set('Auth-Token-SHA-256-B64', btoa(hashString));

	resp = await fetch(newReq);
	return resp;
}

async function handlePoemsEndpoint(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	let resp: any = new Response();

	// const answer = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
	// 	prompt: `Write me a poem using using the following country, region, and city. The country is ${req.cf?.country}, the region is ${req.cf?.region}, and the city is ${req.cf?.city}.`,
	// 	stream: true,
	// });

	let { readable, writable } = new TransformStream();
	let writer = writable.getWriter();
	const textEncoder = new TextEncoder();

	const asyncWrite = async () => {
		const answer = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
			prompt: `Write a poem using the following country, region, and city. The country is ${req.cf?.country}, the region is ${req.cf?.region}, and the city is ${req.cf?.city}.`,
			stream: true,
		});
		const reader = answer.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const chunkString = new TextDecoder().decode(value).slice(6);
			const chunkJson = JSON.parse(chunkString);
			await writer.write(textEncoder.encode(chunkJson?.response));
		}
		return writer.close();
	};

	ctx.waitUntil(asyncWrite());

	resp = new Response(readable, {
		headers: { 'content-type': 'text/event-stream' },
	});

	return resp;
}
