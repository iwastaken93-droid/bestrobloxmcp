import { StarterGui } from "@rbxts/services";
import Utils from "../Utils";

const CHS = game.GetService("ChangeHistoryService") as unknown as {
	TryBeginRecording: (name: string) => string | undefined;
	FinishRecording: (recording: string | undefined, op: Enum.FinishRecordingOperation) => void;
};

const CoreGuiSvc = game.GetService("CoreGui") as unknown as Instance;

// Supported UI element classes that can be created
const UI_CLASSES = new Set<string>([
	"ScreenGui",
	"BillboardGui",
	"Frame",
	"TextLabel",
	"TextButton",
	"TextBox",
	"ImageLabel",
	"ImageButton",
	"ScrollingFrame",
	"ViewportFrame",
	"CanvasGroup",
	"UIListLayout",
	"UIGridLayout",
	"UITableLayout",
	"UIPageLayout",
	"UIStroke",
	"UICorner",
	"UIGradient",
	"UIPadding",
	"UIScale",
	"UIAspectRatioConstraint",
	"UISizeConstraint",
	"UITextSizeConstraint",
]);

const UI_PROPERTIES = [
	"Size", "Position", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency",
	"BorderColor3", "BorderSizePixel", "Visible", "ZIndex", "Text", "TextColor3",
	"TextSize", "TextScaled", "TextWrapped", "Image", "ImageColor3", "ImageTransparency",
	"LayoutOrder", "Padding", "FillDirection", "HorizontalAlignment", "VerticalAlignment",
	"SortOrder", "CellSize", "CellPadding", "Thickness", "CornerRadius", "Scale",
	"AspectRatio", "AspectType", "DominantAxis", "MaxTextSize", "MinTextSize",
];

function isValidUIClass(className: string): boolean {
	return UI_CLASSES.has(className);
}

function resolveInstance(instancePath: string): Instance | undefined {
	if (instancePath === "game.CoreGui") return CoreGuiSvc;
	if (instancePath === "game.StarterGui") return StarterGui;
	return Utils.getInstanceByPath(instancePath);
}

function setProperties(instance: Instance, properties: Record<string, unknown>): string[] {
	const errors: string[] = [];
	for (const [key, value] of pairs(properties) as unknown as Array<[string, unknown]>) {
		const [ok, err] = pcall(() => {
			((instance as unknown) as Record<string, unknown>)[key] = value;
		});
		if (!ok) {
			errors.push(`Failed to set ${key}: ${err}`);
		}
	}
	return errors;
}

function getUIProperties(instance: Instance): Record<string, unknown> {
	const props: Record<string, unknown> = {};
	for (const propName of UI_PROPERTIES) {
		const [ok, value] = pcall(() => {
			return ((instance as unknown) as Record<string, unknown>)[propName];
		});
		if (ok && value !== undefined) {
			if (typeIs(value, "string") || typeIs(value, "number") || typeIs(value, "boolean")) {
				props[propName] = value;
			} else if (typeIs(value, "Vector2")) {
				props[propName] = { X: value.X, Y: value.Y };
			} else if (typeIs(value, "UDim")) {
				props[propName] = { Scale: value.Scale, Offset: value.Offset };
			} else if (typeIs(value, "UDim2")) {
				props[propName] = {
					X: { Scale: value.X.Scale, Offset: value.X.Offset },
					Y: { Scale: value.Y.Scale, Offset: value.Y.Offset },
				};
			} else if (typeIs(value, "Color3")) {
				props[propName] = { R: value.R, G: value.G, B: value.B };
			} else if (typeIs(value, "NumberRange")) {
				props[propName] = { Min: value.Min, Max: value.Max };
			}
		}
	}
	return props;
}

function buildTreeNode(instance: Instance, depth: number = 0): Record<string, unknown> {
	const node: Record<string, unknown> = {
		name: instance.Name,
		className: instance.ClassName,
	};

	if (instance.IsA("GuiObject") || instance.IsA("UILayout") || instance.IsA("UIComponent") || instance.IsA("UIConstraint")) {
		const props = getUIProperties(instance);
		if (next(props as unknown as Record<string, unknown>) !== undefined) {
			node.properties = props;
		}
	}

	if (depth < 20) {
		const children: Record<string, unknown>[] = [];
		for (const child of instance.GetChildren()) {
			children.push(buildTreeNode(child, depth + 1));
		}
		if (children.size() > 0) {
			node.children = children;
		}
	}

	return node;
}

function createUINode(parent: Instance, nodeData: Record<string, unknown>): { instance: Instance | undefined; errors: string[] } {
	const className = nodeData.className as string;
	const name = (nodeData.name as string) || className;
	const properties = (nodeData.properties as Record<string, unknown>) || {};
	const children = (nodeData.children as Array<Record<string, unknown>>) || [];

	const errors: string[] = [];

	if (!className || !isValidUIClass(className)) {
		errors.push(`Invalid or missing UI class: ${className}`);
		return { instance: undefined, errors };
	}

	const [ok, instance] = pcall(() => {
		const newInstance = new Instance(className as keyof CreatableInstances);
		newInstance.Name = name;
		return newInstance;
	});

	if (!ok || !instance) {
		errors.push(`Failed to create ${className}`);
		return { instance: undefined, errors };
	}

	const propErrors = setProperties(instance, properties);
	for (const err of propErrors) {
		errors.push(err);
	}

	const [parentOk, parentErr] = pcall(() => {
		instance.Parent = parent;
	});
	if (!parentOk) {
		errors.push(`Failed to parent ${name}: ${parentErr}`);
		instance.Destroy();
		return { instance: undefined, errors };
	}

	for (const childNode of children) {
		const childResult = createUINode(instance, childNode);
		for (const err of childResult.errors) {
			errors.push(err);
		}
	}

	return { instance, errors };
}

export default {
	create_tree(data: Record<string, unknown>): Record<string, unknown> {
		const parentPath = data.parentPath as string;
		const tree = data.tree as Record<string, unknown>;

		if (!parentPath || !tree) {
			return { error: "parentPath and tree are required for create_tree" };
		}

		const parent = resolveInstance(parentPath);
		if (!parent) {
			return { error: `Parent not found: ${parentPath}` };
		}

		const recording = CHS.TryBeginRecording("Create UI tree");
		const result = createUINode(parent, tree);
		if (recording) {
			CHS.FinishRecording(recording, Enum.FinishRecordingOperation.Commit);
		}

		if (!result.instance) {
			return {
				success: false,
				errors: result.errors,
			};
		}

		return {
			success: result.errors.size() === 0,
			instancePath: `${parentPath}.${result.instance.Name}`,
			errors: result.errors,
		};
	},

	update(data: Record<string, unknown>): Record<string, unknown> {
		const instancePath = data.instancePath as string;
		const properties = data.properties as Record<string, unknown>;

		if (!instancePath || !properties) {
			return { error: "instancePath and properties are required for update" };
		}

		const instance = resolveInstance(instancePath);
		if (!instance) {
			return { error: `Instance not found: ${instancePath}` };
		}

		const recording = CHS.TryBeginRecording("Update UI properties");
		const errors = setProperties(instance, properties);
		if (recording) {
			CHS.FinishRecording(recording, Enum.FinishRecordingOperation.Commit);
		}

		return {
			success: errors.size() === 0,
			errors,
		};
	},

	delete(data: Record<string, unknown>): Record<string, unknown> {
		const instancePath = data.instancePath as string;

		if (!instancePath) {
			return { error: "instancePath is required for delete" };
		}

		const instance = resolveInstance(instancePath);
		if (!instance) {
			return { error: `Instance not found: ${instancePath}` };
		}

		const recording = CHS.TryBeginRecording("Delete UI element");
		instance.Destroy();
		if (recording) {
			CHS.FinishRecording(recording, Enum.FinishRecordingOperation.Commit);
		}

		return { success: true };
	},

	list(data: Record<string, unknown>): Record<string, unknown> {
		const parentPath = data.parentPath as string;

		if (!parentPath) {
			return { error: "parentPath is required for list" };
		}

		const parent = resolveInstance(parentPath);
		if (!parent) {
			return { error: `Parent not found: ${parentPath}` };
		}

		const items: Array<{ name: string; className: string; path: string }> = [];
		for (const child of parent.GetChildren()) {
			items.push({
				name: child.Name,
				className: child.ClassName,
				path: `${parentPath}.${child.Name}`,
			});
		}

		return { success: true, items, count: items.size() };
	},

	get_tree(data: Record<string, unknown>): Record<string, unknown> {
		const instancePath = data.instancePath as string;

		if (!instancePath) {
			return { error: "instancePath is required for get_tree" };
		}

		const instance = resolveInstance(instancePath);
		if (!instance) {
			return { error: `Instance not found: ${instancePath}` };
		}

		return { success: true, tree: buildTreeNode(instance) };
	},

	preview(data: Record<string, unknown>): Record<string, unknown> {
		const instancePath = data.instancePath as string;

		if (!instancePath) {
			return { error: "instancePath is required for preview" };
		}

		const instance = resolveInstance(instancePath);
		if (!instance) {
			return { error: `Instance not found: ${instancePath}` };
		}

		const tree = buildTreeNode(instance);
		let dimensions: Record<string, number> | undefined;
		const [ok, absSize] = pcall(() => {
			return (instance as GuiObject).AbsoluteSize;
		});
		if (ok && absSize) {
			dimensions = { X: absSize.X, Y: absSize.Y };
		}

		return {
			success: true,
			tree,
			dimensions,
			note: "Use capture_screenshot for a visual image of this UI element.",
		};
	},

	check(data: Record<string, unknown>): Record<string, unknown> {
		const instancePath = data.instancePath as string;

		if (!instancePath) {
			return { error: "instancePath is required for check" };
		}

		const instance = resolveInstance(instancePath);
		if (!instance) {
			return { error: `Instance not found: ${instancePath}` };
		}

		const issues: string[] = [];
		const info: Record<string, unknown> = {
			name: instance.Name,
			className: instance.ClassName,
			parent: instance.Parent?.Name,
		};

		if (instance.IsA("GuiObject")) {
			const gui = instance as GuiObject;
			if (gui.Size.X.Scale === 0 && gui.Size.X.Offset === 0) {
				issues.push("Size X is zero");
			}
			if (gui.Size.Y.Scale === 0 && gui.Size.Y.Offset === 0) {
				issues.push("Size Y is zero");
			}
			if (gui.Parent === undefined) {
				issues.push("UI element is unparented");
			}
			info.position = {
				X: { Scale: gui.Position.X.Scale, Offset: gui.Position.X.Offset },
				Y: { Scale: gui.Position.Y.Scale, Offset: gui.Position.Y.Offset },
			};
			info.size = {
				X: { Scale: gui.Size.X.Scale, Offset: gui.Size.X.Offset },
				Y: { Scale: gui.Size.Y.Scale, Offset: gui.Size.Y.Offset },
			};
			info.visible = gui.Visible;
		}

		info.childCount = instance.GetChildren().size();

		return {
			success: issues.size() === 0,
			issues,
			info,
		};
	},

	manageUI(data: Record<string, unknown>): Record<string, unknown> {
		const operation = data.operation as string;

		switch (operation) {
			case "create_tree":
				return this.create_tree(data);
			case "update":
				return this.update(data);
			case "delete":
				return this.delete(data);
			case "list":
				return this.list(data);
			case "get_tree":
				return this.get_tree(data);
			case "preview":
				return this.preview(data);
			case "check":
				return this.check(data);
			default:
				return { error: `Unknown UI operation: ${operation}` };
		}
	},
};
