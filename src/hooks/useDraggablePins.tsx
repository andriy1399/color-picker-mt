import { useState, useCallback } from 'react';

interface PinData {
	position: { x: number; y: number };
	color: string;
	isDragging: boolean;
}

interface UseDraggablePinsHook {
	pins: PinData[];
	addPin: (color: string, x: number, y: number) => void;
	updatePinPosition: (index: number, x: number, y: number, canvasRect: DOMRect, color: string) => void;
	startDragging: (index: number) => void;
	stopDragging: () => void;
}

const useDraggablePins = (): UseDraggablePinsHook => {
	const [pins, setPins] = useState<PinData[]>([]);

	const addPin = useCallback((color: string, x: number, y: number) => {
		setPins((prevPins) => {
			if (prevPins.length >= 6) {
				console.warn('Maximum number of pins reached');
				return prevPins;
			}

			const newPin = { position: { x, y }, color, isDragging: false };
			return [...prevPins, newPin];
		});
	}, []);

	const updatePinPosition = useCallback((index: number, x: number, y: number, canvasRect: DOMRect, color: string) => {
		// Constrain the position within the canvas boundaries
		const newX = Math.min(Math.max(x, 0), canvasRect.width);
		const newY = Math.min(Math.max(y, 0), canvasRect.height);

		setPins((prevPins) =>
			prevPins.map((pin, i) => {
				if (i === index && pin.isDragging) {
					return { ...pin, position: { x: newX, y: newY }, color };
				}
				return pin;
			})
		);
	}, []);

	const startDragging = useCallback((index: number) => {
		setPins((prevPins) =>
			prevPins.map((pin, i) => {
				if (i === index) {
					return { ...pin, isDragging: true };
				}
				return pin;
			})
		);
	}, []);

	const stopDragging = useCallback(() => {
		setPins((prevPins) => prevPins.map((pin) => ({ ...pin, isDragging: false })));
	}, []);

	return {
		pins,
		addPin,
		updatePinPosition,
		startDragging,
		stopDragging,
	};
};

export default useDraggablePins;
