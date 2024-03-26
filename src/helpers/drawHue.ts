import { hsvToRgb } from './hsvToRgb';

export const drawHueSaturationCanvas = (canvas: HTMLCanvasElement | null, hue: number) => {
	const ctx = canvas?.getContext('2d');
	if (!ctx) return;

	const width = ctx.canvas.width;
	const height = ctx.canvas.height;
	const imageData = ctx.createImageData(width, height);

	for (let y = 0; y < height; y++) {
		// As 'y' increases, 'value' decreases (from top to bottom, light to dark).
		const value = 1 - y / height;

		for (let x = 0; x < width; x++) {
			// 'x' represents saturation (from left to right, desaturated to fully saturated).
			const saturation = x / width;

			// Assuming 'hue' is a constant value representing the selected hue.
			const [r, g, b] = hsvToRgb(hue, saturation, value);

			const offset = (y * width + x) * 4;
			imageData.data[offset] = r;
			imageData.data[offset + 1] = g;
			imageData.data[offset + 2] = b;
			imageData.data[offset + 3] = 255; // Full alpha
		}
	}

	ctx.putImageData(imageData, 0, 0);
};

export const drawHueSlider = (canvas: HTMLCanvasElement | null) => {
	if (!canvas) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const width = ctx.canvas.width;
	const gradient = ctx.createLinearGradient(0, 0, width, 0);

	// Create color stops for the gradient from 0 to 360 degrees
	for (let i = 0; i <= 360; i += 30) {
		gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
	}

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, canvas.height);
};
