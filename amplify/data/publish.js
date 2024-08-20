export function request() {
	return {}
}

/**
 * @param {import('@aws-appsync/utils').Context} ctx
 */
export function response(ctx) {
	return ctx.args
}
