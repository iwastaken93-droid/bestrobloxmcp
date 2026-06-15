import { ChangeHistoryService, CoreGui, StarterGui } from "@rbxts/services";
import Utils from "../Utils";

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

// Key properties to include in tree output for UI elements
const UI_PROPERTIES = [
  "Size",
  "Position",
  "AnchorPoint",
  "BackgroundColor3",
  "BackgroundTransparency",
  "BorderColor3",
  "BorderSizePixel",
  "Visible",
  "ZIndex",
  "Text",
  "TextColor3",
  "TextSize",
  "TextScaled",
  "TextWrapped",
  "Image",
  "ImageColor3",
  "ImageTransparency",
  "LayoutOrder",
  "Padding",
  "FillDirection",
  "HorizontalAlignment",
  "VerticalAlignment",
  "SortOrder",
  "CellSize",
  "CellPadding",
  "Thickness",
  "CornerRadius",
  "Scale",
  "AspectRatio",
  "AspectType",
  "DominantAxis",
  "MaxTextSize",
  "MinTextSize",
];

function isValidUIClass(className: string): boolean {
  return UI_CLASSES.has(className);
}

function resolveInstance(instancePath: string): Instance | undefined {
  if (instancePath === "game.CoreGui") return CoreGui;
  if (instancePath === "game.StarterGui") return StarterGui;
  return Utils.resolvePath(instancePath);
}

function setProperties(instance: Instance, properties: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(properties)) {
    const [ok, err] = pcall(() => {
      (instance as any)[key] = value;
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
      return (instance as any)[propName];
    });
    if (ok && value !== undefined) {
      const valueType = typeof value;
      if (valueType === "string" || valueType === "number" || valueType === "boolean") {
        props[propName] = value;
      } else if (typeIs(value, "Vector2")) {
        const v = value as Vector2;
        props[propName] = { X: v.X, Y: v.Y };
      } else if (typeIs(value, "UDim")) {
        const v = value as UDim;
        props[propName] = { Scale: v.Scale, Offset: v.Offset };
      } else if (typeIs(value, "UDim2")) {
        const v = value as UDim2;
        props[propName] = {
          X: { Scale: v.X.Scale, Offset: v.X.Offset },
          Y: { Scale: v.Y.Scale, Offset: v.Y.Offset },
        };
      } else if (typeIs(value, "Color3")) {
        const v = value as Color3;
        props[propName] = { R: v.R, G: v.G, B: v.B };
      } else if (typeIs(value, "NumberRange")) {
        const v = value as NumberRange;
        props[propName] = { Min: v.Min, Max: v.Max };
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

  // Include key UI properties for GuiObject and UI layout classes
  if (instance.IsA("GuiObject") || instance.IsA("UILayout") || instance.IsA("UIComponent") || instance.IsA("UIConstraint")) {
    const props = getUIProperties(instance);
    if (Object.keys(props).length > 0) {
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
    const newInstance = new Instance(className);
    newInstance.Name = name;
    return newInstance;
  });

  if (!ok || !instance) {
    errors.push(`Failed to create ${className}: ${instance}`);
    return { instance: undefined, errors };
  }

  const propErrors = setProperties(instance, properties);
  errors.push(...propErrors);

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
    errors.push(...childResult.errors);
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

    const recording = ChangeHistoryService.TryBeginRecording("Create UI tree");
    const result = createUINode(parent, tree);
    if (recording) {
      ChangeHistoryService.FinishRecording(recording, Enum.FinishRecordingOperation.Commit);
    }

    if (!result.instance) {
      return {
        success: false,
        errors: result.errors,
      };
    }

    return {
      success: result.errors.length === 0,
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

    const recording = ChangeHistoryService.TryBeginRecording("Update UI properties");
    const errors = setProperties(instance, properties);
    if (recording) {
      ChangeHistoryService.FinishRecording(recording, Enum.FinishRecordingOperation.Commit);
    }

    return {
      success: errors.length === 0,
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

    const recording = ChangeHistoryService.TryBeginRecording("Delete UI element");
    instance.Destroy();
    if (recording) {
      ChangeHistoryService.FinishRecording(recording, Enum.FinishRecordingOperation.Commit);
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

    // Return tree + properties as a structured preview; actual screenshot
    // capture should use the existing capture_screenshot tool.
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

    // Check for common UI issues
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
        Min: { Scale: gui.Position.X.Scale, Offset: gui.Position.X.Offset },
        Max: { Scale: gui.Position.Y.Scale, Offset: gui.Position.Y.Offset },
      };
      info.size = {
        Min: { Scale: gui.Size.X.Scale, Offset: gui.Size.X.Offset },
        Max: { Scale: gui.Size.Y.Scale, Offset: gui.Size.Y.Offset },
      };
      info.visible = gui.Visible;
    }

    info.childCount = instance.GetChildren().size();

    return {
      success: issues.length === 0,
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
