import React, { useCallback, useEffect, useRef, useState } from 'react';
import { findColorPositionOnCanvas } from '../helpers/findColorPositionOnCanvas';
import Pin from '../elements/Pin';
import { drawHueSaturationCanvas, drawHueSlider } from '../helpers/drawHue';
import useDraggablePins from '../hooks/useDraggablePins';

const PixelColorPicker: React.FC = () => {
	const { pins, addPin, updatePinPosition, startDragging, stopDragging } = useDraggablePins();
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

	// const onDrag = useCallback(
	// 	(event: MouseEvent) => {
	// 		if (isDragging && canvasRef.current) {
	// 			const rect = canvasRef.current.getBoundingClientRect();
	// 			const x = event.clientX - rect.left;
	// 			const y = event.clientY - rect.top;
	// 			if (x >= 0 && y >= 0 && x <= canvasRef.current.width && y <= canvasRef.current.height) {
	// 				setColor(getColorFromCanvas(x, y));
	// 				setPinPosition({ x, y });
	// 			}
	// 		}
	// 	},
	// 	[isDragging, getColorFromCanvas]
	// );

	const pickColor = useCallback(
		(event: React.MouseEvent<HTMLCanvasElement>) => {
			const rect = event.currentTarget.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const c = getColorFromCanvas(x, y);
			addPin(c, x, y);
			setColor(getColorFromCanvas(x, y));
			setPinPosition({ x, y });
		},
		[getColorFromCanvas, addPin]
	);

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (canvasRef.current) {
				const canvasRect = canvasRef.current.getBoundingClientRect();
				const x = event.clientX - canvasRect.left;
				const y = event.clientY - canvasRect.top;
				if (x >= 0 && y >= 0 && x <= canvasRef.current.width && y <= canvasRef.current.height) {
					pins.forEach((pin, index) => {
						if (pin.isDragging) {
							updatePinPosition(index, x, y, canvasRect, getColorFromCanvas(x, y));
						}
					});
				}
			}
		};

		if (pins.some((pin) => pin.isDragging)) {
			window.addEventListener('mousemove', handleMouseMove);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	}, [getColorFromCanvas, pins, updatePinPosition]);

	useEffect(() => {
		const handleMouseUp = () => {
			stopDragging();
		};

		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [stopDragging]);

	const onPinMouseDown = (index: number) => {
		startDragging(index);
	};

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
		const hueValue = (x / width) * 360;
		setHuePinPosition({ x, y: rect.height / 2 });
		setHue(hueValue);
		drawHueSaturationCanvas(canvasRef.current, hueValue);
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

	// useEffect(() => {
	// 	if (isDragging) {
	// 		window.addEventListener('mousemove', onDrag);
	// 		window.addEventListener('mouseup', endDrag);
	// 	}

	// 	return () => {
	// 		window.removeEventListener('mousemove', onDrag);
	// 		window.removeEventListener('mouseup', endDrag);
	// 	};
	// }, [isDragging, onDrag, endDrag]);

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
			{pins.map((pin, index) => (
				<Pin key={index} startDrag={() => onPinMouseDown(index)} x={pin.position.x} y={pin.position.y} />
			))}

			{pins.map((p) => (
				<div style={{ display: 'flex', gap: '20px' }}>
					<div style={{ background: p.color, height: '50px', width: '50px' }}></div>
					<p>{p.color}</p>
				</div>
			))}

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
