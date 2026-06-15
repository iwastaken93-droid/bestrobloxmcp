import Utils from "../Utils";
import Recording from "../Recording";

const { beginRecording, finishRecording } = Recording;

const Lighting = game.GetService("Lighting");

function manageLighting(requestData: Record<string, unknown>) {
	const action = requestData.action as string;
	const settings = (requestData.settings as Record<string, unknown>) ?? {};

	if (!action) {
		return { error: "action is required" };
	}

	const recordingId = beginRecording(`Lighting ${action}`);

	const [success, result] = pcall(() => {
		if (action === "set_time") {
			const timeOfDay = settings.timeOfDay as string;
			if (!timeOfDay) {
				return { error: "timeOfDay is required" };
			}
			Lighting.TimeOfDay = timeOfDay;
			return {
				success: true,
				action: "set_time",
				timeOfDay,
				message: "Time of day set successfully",
			};
		} else if (action === "set_atmosphere") {
			const density = settings.density as number;
			const color = settings.color as number[];
			const offset = settings.offset as number;
			const glare = settings.glare as number;
			const haze = settings.haze as number;

			let atmosphere = Lighting.FindFirstChildOfClass("Atmosphere");
			if (!atmosphere) {
				atmosphere = new Instance("Atmosphere") as Atmosphere;
				atmosphere.Parent = Lighting;
			}
			const atm = atmosphere as Atmosphere;

			if (density !== undefined) atm.Density = density;
			if (color && color.size() >= 3) atm.Color = new Color3(color[0], color[1], color[2]);
			if (offset !== undefined) atm.Offset = offset;
			if (glare !== undefined) atm.Glare = glare;
			if (haze !== undefined) atm.Haze = haze;

			return {
				success: true,
				action: "set_atmosphere",
				atmosphere: {
					density: atm.Density,
					color: [atm.Color.R, atm.Color.G, atm.Color.B],
					offset: atm.Offset,
					glare: atm.Glare,
					haze: atm.Haze,
				},
				message: "Atmosphere set successfully",
			};
		} else if (action === "set_bloom") {
			const intensity = settings.intensity as number;
			const size = settings.size as number;
			const threshold = settings.threshold as number;

			let bloom = Lighting.FindFirstChildOfClass("BloomEffect");
			if (!bloom) {
				bloom = new Instance("BloomEffect") as BloomEffect;
				bloom.Parent = Lighting;
			}
			const b = bloom as BloomEffect;

			if (intensity !== undefined) b.Intensity = intensity;
			if (size !== undefined) b.Size = size;
			if (threshold !== undefined) b.Threshold = threshold;

			return {
				success: true,
				action: "set_bloom",
				bloom: {
					intensity: b.Intensity,
					size: b.Size,
					threshold: b.Threshold,
				},
				message: "Bloom set successfully",
			};
		} else if (action === "set_color_correction") {
			const brightness = settings.brightness as number;
			const contrast = settings.contrast as number;
			const saturation = settings.saturation as number;
			const tint = settings.tint as number[];

			let cc = Lighting.FindFirstChildOfClass("ColorCorrectionEffect");
			if (!cc) {
				cc = new Instance("ColorCorrectionEffect") as ColorCorrectionEffect;
				cc.Parent = Lighting;
			}
			const c = cc as ColorCorrectionEffect;

			if (brightness !== undefined) c.Brightness = brightness;
			if (contrast !== undefined) c.Contrast = contrast;
			if (saturation !== undefined) c.Saturation = saturation;
			if (tint && tint.size() >= 3) c.TintColor = new Color3(tint[0], tint[1], tint[2]);

			return {
				success: true,
				action: "set_color_correction",
				colorCorrection: {
					brightness: c.Brightness,
					contrast: c.Contrast,
					saturation: c.Saturation,
					tint: [c.TintColor.R, c.TintColor.G, c.TintColor.B],
				},
				message: "Color correction set successfully",
			};
		} else if (action === "get_settings") {
			const atmosphere = Lighting.FindFirstChildOfClass("Atmosphere");
			const bloom = Lighting.FindFirstChildOfClass("BloomEffect");
			const colorCorrection = Lighting.FindFirstChildOfClass("ColorCorrectionEffect");
			const sunRays = Lighting.FindFirstChildOfClass("SunRaysEffect");
			const depthOfField = Lighting.FindFirstChildOfClass("DepthOfFieldEffect");
			const blur = Lighting.FindFirstChildOfClass("BlurEffect");

			return {
				success: true,
				action: "get_settings",
				lighting: {
					ambient: [Lighting.Ambient.R, Lighting.Ambient.G, Lighting.Ambient.B],
					brightness: Lighting.Brightness,
					colorShiftBottom: [Lighting.ColorShift_Bottom.R, Lighting.ColorShift_Bottom.G, Lighting.ColorShift_Bottom.B],
					colorShiftTop: [Lighting.ColorShift_Top.R, Lighting.ColorShift_Top.G, Lighting.ColorShift_Top.B],
					outdoorAmbient: [Lighting.OutdoorAmbient.R, Lighting.OutdoorAmbient.G, Lighting.OutdoorAmbient.B],
					shadowSoftness: Lighting.ShadowSoftness,
					technology: tostring(Lighting.Technology),
					timeOfDay: Lighting.TimeOfDay,
					geographicLatitude: Lighting.GeographicLatitude,
					exposureCompensation: Lighting.ExposureCompensation,
					fogColor: [Lighting.FogColor.R, Lighting.FogColor.G, Lighting.FogColor.B],
					fogEnd: Lighting.FogEnd,
					fogStart: Lighting.FogStart,
				},
				atmosphere: atmosphere ? {
					density: (atmosphere as Atmosphere).Density,
					color: [(atmosphere as Atmosphere).Color.R, (atmosphere as Atmosphere).Color.G, (atmosphere as Atmosphere).Color.B],
					offset: (atmosphere as Atmosphere).Offset,
					glare: (atmosphere as Atmosphere).Glare,
					haze: (atmosphere as Atmosphere).Haze,
				} : undefined,
				bloom: bloom ? {
					intensity: (bloom as BloomEffect).Intensity,
					size: (bloom as BloomEffect).Size,
					threshold: (bloom as BloomEffect).Threshold,
				} : undefined,
				colorCorrection: colorCorrection ? {
					brightness: (colorCorrection as ColorCorrectionEffect).Brightness,
					contrast: (colorCorrection as ColorCorrectionEffect).Contrast,
					saturation: (colorCorrection as ColorCorrectionEffect).Saturation,
					tint: [(colorCorrection as ColorCorrectionEffect).TintColor.R, (colorCorrection as ColorCorrectionEffect).TintColor.G, (colorCorrection as ColorCorrectionEffect).TintColor.B],
				} : undefined,
				sunRays: sunRays ? {
					intensity: (sunRays as SunRaysEffect).Intensity,
					spread: (sunRays as SunRaysEffect).Spread,
				} : undefined,
				depthOfField: depthOfField ? {
					farIntensity: (depthOfField as DepthOfFieldEffect).FarIntensity,
					focusDistance: (depthOfField as DepthOfFieldEffect).FocusDistance,
					inFocusRadius: (depthOfField as DepthOfFieldEffect).InFocusRadius,
					nearIntensity: (depthOfField as DepthOfFieldEffect).NearIntensity,
				} : undefined,
				blur: blur ? {
					size: (blur as BlurEffect).Size,
				} : undefined,
				message: "Lighting settings retrieved",
			};
		} else {
			return { error: `Unknown lighting action: ${action}` };
		}
	});

	finishRecording(recordingId, success && result && (result as Record<string, unknown>).success === true);

	if (success) {
		return result;
	}
	return { error: `Lighting operation failed: ${result}` };
}

export = {
	manageLighting,
};
