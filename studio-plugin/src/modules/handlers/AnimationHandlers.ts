import Utils from "../Utils";
import Recording from "../Recording";

const { getInstanceByPath, getInstancePath } = Utils;
const { beginRecording, finishRecording } = Recording;

function manageAnimation(requestData: Record<string, unknown>) {
	const action = requestData.action as string;
	const params = (requestData.params as Record<string, unknown>) ?? {};

	if (!action) {
		return { error: "action is required" };
	}

	const recordingId = beginRecording(`Animation ${action}`);

	const [success, result] = pcall(() => {
		if (action === "play") {
			const animationId = params.animationId as string;
			const targetPath = params.targetPath as string;
			const loop = (params.loop as boolean) ?? false;
			const speed = (params.speed as number) ?? 1;

			if (!animationId) {
				return { error: "animationId is required" };
			}
			if (!targetPath) {
				return { error: "targetPath is required" };
			}

			const target = getInstanceByPath(targetPath);
			if (!target) {
				return { error: `Target not found: ${targetPath}` };
			}

			let animator: Animator | undefined;
			if (target.IsA("Humanoid")) {
				animator = (target as Humanoid).FindFirstChildOfClass("Animator") as Animator;
				if (!animator) {
					animator = new Instance("Animator") as Animator;
					animator.Parent = target;
				}
			} else if (target.IsA("Animator")) {
				animator = target as Animator;
			} else {
				// Try to find Animator in target's children
				animator = target.FindFirstChildOfClass("Animator") as Animator;
				if (!animator) {
					return { error: "Target must be a Humanoid or contain an Animator" };
				}
			}

			const animation = new Instance("Animation") as Animation;
			animation.AnimationId = animationId;

			const track = animator.LoadAnimation(animation);
			track.Looped = loop;
			track.AdjustSpeed(speed);
			track.Play();

			animation.Destroy();

			return {
				success: true,
				action: "play",
				animationId,
				targetPath,
				trackName: track.Name,
				message: "Animation playing",
			};
		} else if (action === "stop") {
			const targetPath = params.targetPath as string;
			const animationId = params.animationId as string;

			if (!targetPath) {
				return { error: "targetPath is required" };
			}

			const target = getInstanceByPath(targetPath);
			if (!target) {
				return { error: `Target not found: ${targetPath}` };
			}

			let stopped = 0;
			const animator = target.FindFirstChildOfClass("Animator") as Animator;
			if (animator) {
				for (const track of animator.GetPlayingAnimationTracks()) {
					if (!animationId || (track.Animation as Animation).AnimationId === animationId) {
						track.Stop();
						stopped++;
					}
				}
			}

			return {
				success: true,
				action: "stop",
				targetPath,
				stoppedCount: stopped,
				message: `${stopped} animation track(s) stopped`,
			};
		} else if (action === "list") {
			const instancePath = params.instancePath as string;
			const searchRoot = instancePath ? getInstanceByPath(instancePath) : game.Workspace;
			if (!searchRoot) {
				return { error: `Instance not found: ${instancePath}` };
			}

			const animations: Record<string, unknown>[] = [];
			function listRecursive(instance: Instance) {
				for (const child of instance.GetChildren()) {
					if (child.IsA("Animation")) {
						animations.push({
							name: child.Name,
							path: getInstancePath(child),
							animationId: (child as Animation).AnimationId,
							parent: child.Parent ? getInstancePath(child.Parent) : undefined,
						});
					}
					listRecursive(child);
				}
			}
			listRecursive(searchRoot);

			return {
				success: true,
				action: "list",
				instancePath: instancePath ?? "game.Workspace",
				animations,
				count: animations.size(),
				message: `${animations.size()} animation(s) found`,
			};
		} else if (action === "tween") {
			const instancePath = params.instancePath as string;
			const propertyName = params.propertyName as string;
			const targetValue = params.targetValue;
			const duration = (params.duration as number) ?? 1;
			const easingStyle = (params.easingStyle as string) ?? "Linear";
			const easingDirection = (params.easingDirection as string) ?? "InOut";

			if (!instancePath || !propertyName || targetValue === undefined) {
				return { error: "instancePath, propertyName, and targetValue are required" };
			}

			const instance = getInstanceByPath(instancePath);
			if (!instance) {
				return { error: `Instance not found: ${instancePath}` };
			}

			const tweenInfo = new TweenInfo(
				duration,
				(Enum.EasingStyle as unknown as Record<string, Enum.EasingStyle>)[easingStyle] ?? Enum.EasingStyle.Linear,
				(Enum.EasingDirection as unknown as Record<string, Enum.EasingDirection>)[easingDirection] ?? Enum.EasingDirection.InOut,
			);

			// Convert target value if needed
			let finalValue: unknown = targetValue;
			if (typeIs(targetValue, "table")) {
				const arr = targetValue as number[];
				if (arr.size() === 3) {
					if (propertyName === "Position" || propertyName === "Size" || propertyName === "Orientation") {
						finalValue = new Vector3(arr[0], arr[1], arr[2]);
					} else if (propertyName === "Color" || propertyName === "Color3") {
						finalValue = new Color3(arr[0], arr[1], arr[2]);
					}
				}
			}

			const tweenService = game.GetService("TweenService");
			const tween = tweenService.Create(instance as Instance, tweenInfo, { [propertyName]: finalValue } as unknown as { [key: string]: unknown });
			tween.Play();

			return {
				success: true,
				action: "tween",
				instancePath,
				propertyName,
				duration,
				message: "Tween started",
			};
		} else {
			return { error: `Unknown animation action: ${action}` };
		}
	});

	finishRecording(recordingId, success && result && (result as Record<string, unknown>).success === true);

	if (success) {
		return result;
	}
	return { error: `Animation operation failed: ${result}` };
}

export = {
	manageAnimation,
};
