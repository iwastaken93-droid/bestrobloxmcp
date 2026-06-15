import Utils from "../Utils";
import Recording from "../Recording";

const { getInstanceByPath, getInstancePath } = Utils;
const { beginRecording, finishRecording } = Recording;

function manageAudio(requestData: Record<string, unknown>) {
	const action = requestData.action as string;
	const params = (requestData.params as Record<string, unknown>) ?? {};

	if (!action) {
		return { error: "action is required" };
	}

	const recordingId = beginRecording(`Audio ${action}`);

	const [success, result] = pcall(() => {
		if (action === "play_sound") {
			const soundId = params.soundId as string;
			const parentPath = params.parentPath as string;
			const volume = (params.volume as number) ?? 0.5;
			const looped = (params.looped as boolean) ?? false;
			const pitch = (params.pitch as number) ?? 1;
			const playTime = (params.playTime as number) ?? -1;

			if (!soundId) {
				return { error: "soundId is required" };
			}

			const parent = parentPath ? getInstanceByPath(parentPath) : game.Workspace;
			if (!parent) {
				return { error: `Parent not found: ${parentPath}` };
			}

			const sound = new Instance("Sound") as Sound;
			sound.SoundId = soundId;
			sound.Volume = volume;
			sound.Looped = looped;
			sound.PlaybackSpeed = pitch;
			sound.Parent = parent;

			sound.Play();

			if (playTime > 0) {
				task.delay(playTime, () => {
					pcall(() => {
						sound.Stop();
						sound.Destroy();
					});
				});
			}

			return {
				success: true,
				action: "play_sound",
				soundId,
				instancePath: getInstancePath(sound),
				message: "Sound playing",
			};
		} else if (action === "stop_sound") {
			const soundPath = params.soundPath as string;
			const soundId = params.soundId as string;

			if (soundPath) {
				const sound = getInstanceByPath(soundPath);
				if (sound && sound.IsA("Sound")) {
					(sound as Sound).Stop();
					return { success: true, action: "stop_sound", soundPath, message: "Sound stopped" };
				}
				return { error: `Sound not found: ${soundPath}` };
			}

			if (soundId) {
				let stopped = 0;
				function stopRecursive(instance: Instance) {
					for (const child of instance.GetChildren()) {
						if (child.IsA("Sound") && (child as Sound).SoundId === soundId) {
							(child as Sound).Stop();
							stopped++;
						}
						stopRecursive(child);
					}
				}
				stopRecursive(game.Workspace);
				return { success: true, action: "stop_sound", soundId, stoppedCount: stopped, message: `${stopped} sound(s) stopped` };
			}

			return { error: "soundPath or soundId is required" };
		} else if (action === "list_sounds") {
			const instancePath = params.instancePath as string;
			const searchRoot = instancePath ? getInstanceByPath(instancePath) : game.Workspace;
			if (!searchRoot) {
				return { error: `Instance not found: ${instancePath}` };
			}

			const sounds: Record<string, unknown>[] = [];
			function listRecursive(instance: Instance) {
				for (const child of instance.GetChildren()) {
					if (child.IsA("Sound")) {
						const s = child as Sound;
						sounds.push({
							name: s.Name,
							path: getInstancePath(s),
							soundId: s.SoundId,
							volume: s.Volume,
							looped: s.Looped,
							playing: s.IsPlaying,
							playbackSpeed: s.PlaybackSpeed,
							parent: s.Parent ? getInstanceByPath(s.Parent) : undefined,
						});
					}
					listRecursive(child);
				}
			}
			listRecursive(searchRoot);

			return {
				success: true,
				action: "list_sounds",
				instancePath: instancePath ?? "game.Workspace",
				sounds,
				count: sounds.size(),
				message: `${sounds.size()} sound(s) found`,
			};
		} else if (action === "set_ambience") {
			const soundId = params.soundId as string;
			const volume = (params.volume as number) ?? 0.3;
			const looped = (params.looped as boolean) ?? true;

			if (!soundId) {
				return { error: "soundId is required" };
			}

			// Remove existing ambience sounds
			for (const child of game.Workspace.GetChildren()) {
				if (child.IsA("Sound") && child.Name === "__MCP_Ambience") {
					child.Destroy();
				}
			}

			const sound = new Instance("Sound") as Sound;
			sound.Name = "__MCP_Ambience";
			sound.SoundId = soundId;
			sound.Volume = volume;
			sound.Looped = looped;
			sound.Parent = game.Workspace;
			sound.Play();

			return {
				success: true,
				action: "set_ambience",
				soundId,
				volume,
				looped,
				message: "Ambience set",
			};
		} else {
			return { error: `Unknown audio action: ${action}` };
		}
	});

	finishRecording(recordingId, success && result && (result as Record<string, unknown>).success === true);

	if (success) {
		return result;
	}
	return { error: `Audio operation failed: ${result}` };
}

export = {
	manageAudio,
};
