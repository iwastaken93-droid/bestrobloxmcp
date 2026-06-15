import Utils from "../Utils";
import Recording from "../Recording";

const { getInstancePath } = Utils;
const { beginRecording, finishRecording } = Recording;

const Terrain = game.Workspace.FindFirstChildOfClass("Terrain") as Terrain;

function manageTerrain(requestData: Record<string, unknown>) {
	const action = requestData.action as string;
	const options = (requestData.options as Record<string, unknown>) ?? {};

	if (!action) {
		return { error: "action is required" };
	}

	const recordingId = beginRecording(`Terrain ${action}`);

	const [success, result] = pcall(() => {
		if (action === "generate") {
			const size = (options.size as number[]) ?? [512, 64, 512];
			const seed = (options.seed as number) ?? math.random(1, 100000);
			const amplitude = (options.amplitude as number) ?? 20;
			const frequency = (options.frequency as number) ?? 0.01;
			const material = (options.material as string) ?? "Grass";
			const materialEnum = (Enum.Material as unknown as Record<string, Enum.Material>)[material] ?? Enum.Material.Grass;

			const region = new Region3(
				new Vector3(-size[0] / 2, -size[1] / 2, -size[2] / 2),
				new Vector3(size[0] / 2, size[1] / 2, size[2] / 2),
			);

			// Generate terrain using noise
			const resolution = 4;
			const [materials, occupancies] = Terrain.ReadVoxels(region, resolution);
			const sizeX = materials.Size.X;
			const sizeY = materials.Size.Y;
			const sizeZ = materials.Size.Z;

			for (let x = 0; x < sizeX; x++) {
				for (let z = 0; z < sizeZ; z++) {
					const worldX = (x * resolution) - size[0] / 2;
					const worldZ = (z * resolution) - size[2] / 2;
					const noise = math.noise(worldX * frequency, worldZ * frequency, seed);
					const height = math.floor((noise + 1) / 2 * amplitude);

					for (let y = 0; y < sizeY; y++) {
						const worldY = (y * resolution) - size[1] / 2;
						if (worldY <= height) {
							materials[x][y][z] = materialEnum;
							occupancies[x][y][z] = 1;
						} else {
							materials[x][y][z] = Enum.Material.Air;
							occupancies[x][y][z] = 0;
						}
					}
				}
			}

			Terrain.WriteVoxels(region, resolution, materials, occupancies);

			return {
				success: true,
				action: "generate",
				seed,
				size,
				amplitude,
				frequency,
				material,
				message: "Terrain generated successfully",
			};
		} else if (action === "fill") {
			const region = options.region as Record<string, number[]>;
			const material = (options.material as string) ?? "Grass";
			const materialEnum = (Enum.Material as unknown as Record<string, Enum.Material>)[material] ?? Enum.Material.Grass;

			if (!region || !region.min || !region.max) {
				return { error: "region.min and region.max are required" };
			}

			const region3 = new Region3(
				new Vector3(region.min[0], region.min[1], region.min[2]),
				new Vector3(region.max[0], region.max[1], region.max[2]),
			);

			Terrain.FillRegion(region3, 4, materialEnum);

			return {
				success: true,
				action: "fill",
				region,
				material,
				message: "Terrain filled successfully",
			};
		} else if (action === "smooth") {
			const region = options.region as Record<string, number[]>;
			const iterations = (options.iterations as number) ?? 1;

			if (!region || !region.min || !region.max) {
				return { error: "region.min and region.max are required" };
			}

			const region3 = new Region3(
				new Vector3(region.min[0], region.min[1], region.min[2]),
				new Vector3(region.max[0], region.max[1], region.max[2]),
			);

			// Smooth terrain by averaging neighboring voxels
			const resolution = 4;
			for (let i = 0; i < iterations; i++) {
				const [materials, occupancies] = Terrain.ReadVoxels(region3, resolution);
				const sizeX = materials.size()[0];
				const sizeY = materials.size()[1];
				const sizeZ = materials.size()[2];

				for (let x = 1; x < sizeX - 1; x++) {
					for (let y = 1; y < sizeY - 1; y++) {
						for (let z = 1; z < sizeZ - 1; z++) {
							let avg = occupancies[x - 1][y][z] + occupancies[x + 1][y][z] +
								occupancies[x][y - 1][z] + occupancies[x][y + 1][z] +
								occupancies[x][y][z - 1] + occupancies[x][y][z + 1];
							avg = avg / 6;
							occupancies[x][y][z] = avg;
						}
					}
				}
				Terrain.WriteVoxels(region3, resolution, materials, occupancies);
			}

			return {
				success: true,
				action: "smooth",
				region,
				iterations,
				message: "Terrain smoothed successfully",
			};
		} else if (action === "read") {
			const region = options.region as Record<string, number[]>;
			const resolution = (options.resolution as number) ?? 4;

			if (!region || !region.min || !region.max) {
				return { error: "region.min and region.max are required" };
			}

			const region3 = new Region3(
				new Vector3(region.min[0], region.min[1], region.min[2]),
				new Vector3(region.max[0], region.max[1], region.max[2]),
			);

			const [materials, occupancies] = Terrain.ReadVoxels(region3, resolution);

			// Count materials
			const materialCounts: Record<string, number> = {};
			const sizeX = materials.Size.X;
			const sizeY = materials.Size.Y;
			const sizeZ = materials.Size.Z;

			for (let x = 0; x < sizeX; x++) {
				for (let y = 0; y < sizeY; y++) {
					for (let z = 0; z < sizeZ; z++) {
						const mat = materials[x][y][z].Name;
						materialCounts[mat] = (materialCounts[mat] ?? 0) + 1;
					}
				}
			}

			return {
				success: true,
				action: "read",
				region,
				resolution,
				materialCounts,
				gridSize: [sizeX, sizeY, sizeZ],
				message: "Terrain read successfully",
			};
		} else if (action === "replace_material") {
			const region = options.region as Record<string, number[]>;
			const oldMaterial = options.oldMaterial as string;
			const newMaterial = options.newMaterial as string;

			if (!region || !region.min || !region.max) {
				return { error: "region.min and region.max are required" };
			}
			if (!oldMaterial || !newMaterial) {
				return { error: "oldMaterial and newMaterial are required" };
			}

			const region3 = new Region3(
				new Vector3(region.min[0], region.min[1], region.min[2]),
				new Vector3(region.max[0], region.max[1], region.max[2]),
			);

			const oldEnum = (Enum.Material as unknown as Record<string, Enum.Material>)[oldMaterial];
			const newEnum = (Enum.Material as unknown as Record<string, Enum.Material>)[newMaterial];

			if (!oldEnum || !newEnum) {
				return { error: `Invalid material names: ${oldMaterial} or ${newMaterial}` };
			}

			Terrain.ReplaceMaterial(region3, 4, oldEnum, newEnum);

			return {
				success: true,
				action: "replace_material",
				region,
				oldMaterial,
				newMaterial,
				message: "Material replaced successfully",
			};
		} else {
			return { error: `Unknown terrain action: ${action}` };
		}
	});

	finishRecording(recordingId, success && result && (result as Record<string, unknown>).success === true);

	if (success) {
		return result;
	}
	return { error: `Terrain operation failed: ${result}` };
}

export = {
	manageTerrain,
};
