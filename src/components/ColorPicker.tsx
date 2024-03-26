import React, { useCallback, useEffect, useRef, useState } from 'react';
import { findColorPositionOnCanvas } from '../helpers/findColorPositionOnCanvas';
import Pin from '../elements/Pin';
import { drawHueSaturationCanvas, drawHueSlider } from '../helpers/drawHue';

const PixelColorPicker: React.FC = () => {
	const [color, setColor] = useState<string>('#000000');
	const [rgbInput, setRgbInput] = useState<string>(color);
	const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
	const [hue, setHue] = useState(0);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const hueCanvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [huePinPosition, setHuePinPosition] = useState<{ x: number; y: number } | null>(null);

	const getColorFromCanvas = useCallback((x: number, y: number) => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d', { willReadFrequently: true });
		if (ctx) {
			const imageData = ctx.getImageData(x, y, 1, 1).data;
			return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
		}
		return '#000000';
	}, []);

	const endDrag = useCallback(() => {
		setIsDragging(false);
	}, []);

	const onDrag = useCallback(
		(event: MouseEvent) => {
			if (isDragging && canvasRef.current) {
				const rect = canvasRef.current.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				if (x >= 0 && y >= 0 && x <= canvasRef.current.width && y <= canvasRef.current.height) {
					setColor(getColorFromCanvas(x, y));
					setPinPosition({ x, y });
				}
			}
		},
		[isDragging, getColorFromCanvas]
	);

	const pickColor = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setColor(getColorFromCanvas(x, y));
			setPinPosition({ x, y });
		},
		[getColorFromCanvas]
	);

	const startDrag = useCallback(() => {
		setIsDragging(true);
	}, []);

	const onCanvasClick = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			pickColor(event);
		},
		[pickColor]
	);

	const handleRgbInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = event.target.value;
		setRgbInput(newColor);

		if (/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/.test(newColor)) {
			setColor(newColor);

			const canvas = canvasRef.current;
			const ctx = canvas?.getContext('2d', { willReadFrequently: true });
			if (ctx && canvas) {
				const position = findColorPositionOnCanvas(ctx, canvas, newColor);
				if (position) {
					setPinPosition(position);
				}
			}
		}
	};

	const handleHueSliderClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = event.currentTarget;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const width = canvas.width;
		console.log(rect);
		// Calculate the hue based on the click position.
		const hueValue = (x / width) * 360;
		setHuePinPosition({ x, y: rect.height / 2 });
		// Now, hue has been selected and you can use it to update your main color picker canvas
		setHue(hueValue);
		drawHueSaturationCanvas(canvasRef.current, hueValue); // Call this function with the new hue to update the color picker
	};

	useEffect(() => {
		setRgbInput(color);
	}, [color]);

	useEffect(() => {
		drawHueSaturationCanvas(canvasRef.current, hue);
	}, [hue]);

	useEffect(() => {
		const hueCanvas = hueCanvasRef.current;
		if (hueCanvas) {
			drawHueSlider(hueCanvas);
		}
	}, []);

	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', onDrag);
			window.addEventListener('mouseup', endDrag);
		}

		return () => {
			window.removeEventListener('mousemove', onDrag);
			window.removeEventListener('mouseup', endDrag);
		};
	}, [isDragging, onDrag, endDrag]);

	return (
		<div ref={containerRef} style={{ position: 'relative' }}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '600px',
					height: '500px',
					marginBottom: '50px',
				}}
			>
				<canvas width="600" height="500" ref={canvasRef} onClick={onCanvasClick} />
				<div style={{ position: 'relative' }}>
					<canvas ref={hueCanvasRef} height="30" width="600" onClick={handleHueSliderClick} />
					{huePinPosition && <Pin startDrag={startDrag} x={huePinPosition.x} y={huePinPosition.y} />}
				</div>
			</div>
			{pinPosition && <Pin startDrag={startDrag} x={pinPosition.x} y={pinPosition.y} />}
			<div style={{ display: 'flex', gap: '20px' }}>
				<div style={{ background: color, height: '50px', width: '50px' }}></div>
				<p>{color}</p>
			</div>

			<input
				type="text"
				value={rgbInput}
				onChange={handleRgbInputChange}
				placeholder="Enter RGB value (e.g., rgb(255,0,0))"
			/>
		</div>
	);
};

export default PixelColorPicker;
