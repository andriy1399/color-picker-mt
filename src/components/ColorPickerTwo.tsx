import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
    onSelectColor: (color: string) => void;
}

const ColorPickerTwo: React.FC<ColorPickerProps> = ({ onSelectColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState({ r: 255, g: 0, b: 0 });
    
    useEffect(() => {
        drawHueSaturationCanvas();
    }, []);

    const drawHueSaturationCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const imageData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const u = x / width;
                const v = y / height;
                const [r, g, b] = hsvToRgb(u * 360, v, 1);
                const offset = (y * width + x) * 4;
                imageData.data[offset] = r;
                imageData.data[offset + 1] = g;
                imageData.data[offset + 2] = b;
                imageData.data[offset + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        setColor({ r: imageData[0], g: imageData[1], b: imageData[2] });
        onSelectColor(`rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width="300"
                height="300"
                onClick={handleCanvasClick}
                style={{ border: '1px solid black' }}
            ></canvas>
        </div>
    );
};

export default ColorPickerTwo;

// Helper function to convert HSV to RGB
const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
    let r = 0, g = 0, b = 0;

    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
