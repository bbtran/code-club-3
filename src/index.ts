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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// console.log('Logging: ', request.url);
		const randomResponseMap: { [key: string]: string } = {
			'0': 'Built with Cloudflare Workers (Response #1)',
			'1': 'Hello World (Response #2)',
			'2': 'Welcome to Code club! (Response #3)',
			'3': 'Random Responses (Response #4)',
		};

		if (request.method == 'POST') {
			const newResponse = Response.json(
				{ message: 'Successful POST', foo: 'bar' },
				{ status: 201, statusText: 'Created', headers: { 'Content-Type': 'application/json' } }
			);
			return newResponse;
		} else {
			const key = getRandomIntString(4);
			return new Response(randomResponseMap[key], { status: 200, statusText: 'OK' });
		}
	},
};

function getRandomIntString(max: number): string {
	return Math.floor(Math.random() * max).toString();
}
