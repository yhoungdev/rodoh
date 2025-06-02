import { CanvasRenderingContext2D } from "canvas";

interface Background {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  type: "solid" | "gradient";
}

/**
 * @param ctx - The canvas rendering context
 * @param canvas - The HTML canvas element
 * @param selectedBackground - The selected background configuration
 * @returns The fillStyle that was applied to the context
 */
export function applyCanvasBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  selectedBackground?: Background | null,
): string {
  if (
    selectedBackground &&
    selectedBackground.type === "gradient" &&
    selectedBackground.gradient
  ) {
    return applyGradientBackground(ctx, canvas, selectedBackground);
  } else if (selectedBackground && selectedBackground.type === "solid") {
    return applySolidBackground(ctx, selectedBackground);
  } else {
    ctx.fillStyle = "#f8f9fa";
    return ctx.fillStyle as string;
  }
}

function applySolidBackground(
  ctx: CanvasRenderingContext2D,
  selectedBackground: Background,
): string {
  if (selectedBackground.color.startsWith("bg-")) {
    switch (selectedBackground.color) {
      case "bg-white":
        ctx.fillStyle = "#ffffff";
        break;
      case "bg-slate-900":
        ctx.fillStyle = "#0f172a";
        break;
      case "bg-zinc-800":
        ctx.fillStyle = "#27272a";
        break;
      case "bg-blue-600":
        ctx.fillStyle = "#2563eb";
        break;
      case "bg-green-600":
        ctx.fillStyle = "#16a34a";
        break;
      case "bg-red-600":
        ctx.fillStyle = "#dc2626";
        break;
      default:
        ctx.fillStyle = "#000000";
        break;
    }
  } else {
    ctx.fillStyle = selectedBackground.color;
  }

  return ctx.fillStyle as string;
}

function applyGradientBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  selectedBackground: Background,
): string {
  if (!selectedBackground.gradient) {
    ctx.fillStyle = selectedBackground.color;
    return ctx.fillStyle as string;
  }

  if (selectedBackground.gradient.includes("from-")) {
    return applyTailwindGradient(ctx, canvas, selectedBackground.gradient);
  } else if (selectedBackground.gradient.includes("linear-gradient")) {
    return applyCssGradient(ctx, canvas, selectedBackground.gradient);
  } else {
    ctx.fillStyle = selectedBackground.color;
    return ctx.fillStyle as string;
  }
}

function applyTailwindGradient(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gradientStr: string,
): string {
  let startColor = "#3b82f6";
  let endColor = "#2563eb";

  if (gradientStr.includes("from-rose-500")) {
    startColor = "#f43f5e";
    endColor = gradientStr.includes("to-orange-500") ? "#f97316" : "#f43f5e";
  } else if (gradientStr.includes("from-blue-500")) {
    startColor = "#3b82f6";
    endColor = gradientStr.includes("to-cyan-500") ? "#06b6d4" : "#3b82f6";
  } else if (gradientStr.includes("from-violet-500")) {
    startColor = "#8b5cf6";
    endColor = gradientStr.includes("to-purple-500") ? "#a855f7" : "#8b5cf6";
  } else if (gradientStr.includes("from-emerald-500")) {
    startColor = "#10b981";
    endColor = gradientStr.includes("to-teal-500") ? "#14b8a6" : "#10b981";
  } else if (gradientStr.includes("from-pink-500")) {
    startColor = "#ec4899";
    endColor = gradientStr.includes("to-rose-500") ? "#f43f5e" : "#ec4899";
  } else if (gradientStr.includes("from-amber-500")) {
    startColor = "#f59e0b";
    endColor = gradientStr.includes("to-yellow-500") ? "#eab308" : "#f59e0b";
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  ctx.fillStyle = gradient;

  return gradient as unknown as string;
}

function applyCssGradient(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gradientStr: string,
): string {
  const directionMatch = gradientStr.match(/to (right|left|bottom|top)/);
  const colorMatches = gradientStr.match(/#[a-f\d]+/gi);

  if (colorMatches && colorMatches.length >= 2) {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    if (directionMatch) {
      if (directionMatch[0].includes("to right")) {
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      } else if (directionMatch[0].includes("to left")) {
        gradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
      } else if (directionMatch[0].includes("to bottom")) {
        gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      } else if (directionMatch[0].includes("to top")) {
        gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      }
    }

    gradient.addColorStop(0, colorMatches[0]);
    gradient.addColorStop(1, colorMatches[1]);
    ctx.fillStyle = gradient;
    return gradient as unknown as string;
  } else {
    ctx.fillStyle = "#f8f9fa";
    return ctx.fillStyle as string;
  }
}
