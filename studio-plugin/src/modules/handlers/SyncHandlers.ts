// ponytail: Sync is a server-side feature (file system operations). The plugin
// returns a placeholder that the server can intercept and handle locally.

function manageSync(requestData: Record<string, unknown>) {
	const action = requestData.action as string;
	const params = (requestData.params as Record<string, unknown>) ?? {};

	if (!action) {
		return { error: "action is required" };
	}

	// The server handles sync operations directly since it has file system access.
	// The plugin just returns a pass-through so the server knows it should handle it.
	return {
		success: true,
		action,
		params,
		pluginHandled: false,
		message: `Sync action '${action}' should be handled by the server. This plugin response is a placeholder.`,
	};
}

export = {
	manageSync,
};
