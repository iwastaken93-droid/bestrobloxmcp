import Utils from "../Utils";

const { getInstanceByPath, getInstancePath } = Utils;

function spatialQuery(requestData: Record<string, unknown>) {
	const queryType = requestData.queryType as string;
	const params = (requestData.params as Record<string, unknown>) ?? {};

	if (!queryType) {
		return { error: "queryType is required" };
	}

	const [success, result] = pcall(() => {
		if (queryType === "raycast") {
			const origin = params.origin as number[];
			const direction = params.direction as number[];
			const maxDistance = (params.maxDistance as number) ?? 1000;
			const ignoreList = params.ignoreList as string[];

			if (!origin || !direction) {
				return { error: "origin and direction are required" };
			}

			const rayOrigin = new Vector3(origin[0], origin[1], origin[2]);
			const rayDirection = new Vector3(direction[0], direction[1], direction[2]).Unit * maxDistance;

			const ignoreInstances: Instance[] = [];
			if (ignoreList) {
				for (const path of ignoreList) {
					const inst = getInstanceByPath(path);
					if (inst) ignoreInstances.push(inst);
				}
			}

			const raycastParams = new RaycastParams();
			raycastParams.FilterType = Enum.RaycastFilterType.Blacklist;
			raycastParams.FilterDescendantsInstances = ignoreInstances;

			const result = game.Workspace.Raycast(rayOrigin, rayDirection, raycastParams);

			if (result) {
				return {
					success: true,
					queryType: "raycast",
					hit: true,
					position: [result.Position.X, result.Position.Y, result.Position.Z],
					normal: [result.Normal.X, result.Normal.Y, result.Normal.Z],
					instance: result.Instance ? {
						name: result.Instance.Name,
						className: result.Instance.ClassName,
						path: getInstancePath(result.Instance),
					} : undefined,
					material: result.Material ? result.Material.Name : undefined,
					distance: (result.Position.sub(rayOrigin)).Magnitude,
					message: "Raycast hit",
				};
			}

			return {
				success: true,
				queryType: "raycast",
				hit: false,
				message: "Raycast did not hit anything",
			};
		} else if (queryType === "find_ground") {
			const position = params.position as number[];
			const maxDistance = (params.maxDistance as number) ?? 1000;

			if (!position) {
				return { error: "position is required" };
			}

			const rayOrigin = new Vector3(position[0], position[1] + maxDistance, position[2]);
			const rayDirection = new Vector3(0, -maxDistance * 2, 0);

			const raycastParams = new RaycastParams();
			raycastParams.FilterType = Enum.RaycastFilterType.Blacklist;

			const result = game.Workspace.Raycast(rayOrigin, rayDirection, raycastParams);

			if (result) {
				return {
					success: true,
					queryType: "find_ground",
					found: true,
					groundPosition: [result.Position.X, result.Position.Y, result.Position.Z],
					instance: result.Instance ? {
						name: result.Instance.Name,
						className: result.Instance.ClassName,
						path: getInstancePath(result.Instance),
					} : undefined,
					material: result.Material ? result.Material.Name : undefined,
					message: "Ground found",
				};
			}

			return {
				success: true,
				queryType: "find_ground",
				found: false,
				message: "No ground found within range",
			};
		} else if (queryType === "check_placement") {
			const position = params.position as number[];
			const size = params.size as number[];
			const shape = (params.shape as string) ?? "box";

			if (!position || !size) {
				return { error: "position and size are required" };
			}

			const pos = new Vector3(position[0], position[1], position[2]);
			const sz = new Vector3(size[0], size[1], size[2]);

			let partsInRegion: Instance[];
			const overlapParams = new OverlapParams();
			overlapParams.FilterType = Enum.RaycastFilterType.Blacklist;
			if (shape === "box") {
				partsInRegion = game.Workspace.GetPartBoundsInBox(new CFrame(pos), sz, overlapParams);
			} else {
				// Sphere check using bounding box overlap
				partsInRegion = game.Workspace.GetPartBoundsInBox(new CFrame(pos), sz, overlapParams);
			}

			const obstacles = partsInRegion.filter((part) => part.IsA("BasePart")).map((part) => ({
				name: part.Name,
				path: getInstancePath(part),
				className: part.ClassName,
			}));

			return {
				success: true,
				queryType: "check_placement",
				canPlace: obstacles.size() === 0,
				obstacles,
				obstacleCount: obstacles.size(),
				message: obstacles.size() === 0 ? "Placement is clear" : `${obstacles.size()} obstacle(s) found`,
			};
		} else if (queryType === "bounds") {
			const instancePath = params.instancePath as string;

			if (!instancePath) {
				return { error: "instancePath is required" };
			}

			const instance = getInstanceByPath(instancePath);
			if (!instance) {
				return { error: `Instance not found: ${instancePath}` };
			}

			let bounds: { min: number[]; max: number[]; center: number[]; size: number[] };
			if (instance.IsA("BasePart")) {
				const part = instance as BasePart;
				const min = part.Position.sub(part.Size.div(2));
				const max = part.Position.add(part.Size.div(2));
				bounds = {
					min: [min.X, min.Y, min.Z],
					max: [max.X, max.Y, max.Z],
					center: [part.Position.X, part.Position.Y, part.Position.Z],
					size: [part.Size.X, part.Size.Y, part.Size.Z],
				};
			} else if (instance.IsA("Model")) {
				const model = instance as Model;
				const [cf, modelSize] = model.GetBoundingBox();
				const min = cf.Position.sub(modelSize.div(2));
				const max = cf.Position.add(modelSize.div(2));
				bounds = {
					min: [min.X, min.Y, min.Z],
					max: [max.X, max.Y, max.Z],
					center: [cf.Position.X, cf.Position.Y, cf.Position.Z],
					size: [modelSize.X, modelSize.Y, modelSize.Z],
				};
			} else {
				return { error: "Instance must be a BasePart or Model" };
			}

			return {
				success: true,
				queryType: "bounds",
				instancePath,
				bounds,
				message: "Bounds calculated",
			};
		} else if (queryType === "nearest") {
			const position = params.position as number[];
			const className = params.className as string;
			const maxDistance = (params.maxDistance as number) ?? 1000;
			const maxResults = (params.maxResults as number) ?? 10;

			if (!position || !className) {
				return { error: "position and className are required" };
			}

			const pos = new Vector3(position[0], position[1], position[2]);

			const instances: { instance: Instance; distance: number }[] = [];
			function findRecursive(instance: Instance) {
				if (instance.IsA(className as keyof Instances)) {
					let instPos: Vector3 | undefined;
					if (instance.IsA("BasePart")) {
						instPos = (instance as BasePart).Position;
					} else if (instance.IsA("Model")) {
						instPos = (instance as Model).GetPivot().Position;
					}
					if (instPos) {
						const dist = pos.sub(instPos).Magnitude;
						if (dist <= maxDistance) {
							instances.push({ instance, distance: dist });
						}
					}
				}
				for (const child of instance.GetChildren()) {
					findRecursive(child);
				}
			}
			findRecursive(game.Workspace);

			instances.sort((a, b) => a.distance < b.distance);

			const results = instances.slice(0, maxResults).map((item) => ({
				name: item.instance.Name,
				className: item.instance.ClassName,
				path: getInstancePath(item.instance),
				distance: item.distance,
			}));

			return {
				success: true,
				queryType: "nearest",
				position,
				className,
				results,
				count: results.size(),
				message: `${results.size()} instance(s) found`,
			};
		} else {
			return { error: `Unknown spatial query type: ${queryType}` };
		}
	});

	if (success) {
		return result;
	}
	return { error: `Spatial query failed: ${result}` };
}

export = {
	spatialQuery,
};
