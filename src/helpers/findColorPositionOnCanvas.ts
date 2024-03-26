export const findColorPositionOnCanvas = (
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	searchColor: string
): { x: number; y: number } | null => {
	const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imgData.data;

	for (let i = 0; i < data.length; i += 4) {
		const rgb = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
		if (rgb === searchColor) {
			const x = (i / 4) % canvas.width;
			const y = Math.floor(i / 4 / canvas.width);
			return { x, y };
		}
	}
	return null;
};
