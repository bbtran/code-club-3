import type { NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
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
}

function getRandomIntString(max: number): string {
	return Math.floor(Math.random() * max).toString();
}
