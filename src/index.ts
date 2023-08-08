import app from '~/app';
import { ZodIssue } from "zod";

declare let globalThis: { env: Env};

export default {

	async fetch(
		req: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		globalThis = {
			env : env
		};
		let response = await app.fetch(req, env, ctx);
		if (response.status !== 400) return response;
		// zod returns error format that has additional information we're not using right now
		// before sending response to we alter it to map the error array.
		let json = await response.json<any>();
		if (json?.error?.name === 'ZodError') {
			const errors = json?.error?.issues.map((i: ZodIssue) => i.path.join(', ') + ' ' + i.message);
			json = JSON.stringify(errors);
		}
		return new Response(json, response);
	},

};
