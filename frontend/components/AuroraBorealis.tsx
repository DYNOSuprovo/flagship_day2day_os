"use client";

import { useEffect, useRef } from "react";

export default function AuroraBorealis() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.005;

            // Clear with dark background
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw aurora layers
            const layers = [
                { color: "rgba(0, 255, 128, 0.1)", offset: 0 },
                { color: "rgba(0, 200, 255, 0.08)", offset: 0.3 },
                { color: "rgba(128, 0, 255, 0.06)", offset: 0.6 }
            ];

            layers.forEach((layer, layerIndex) => {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * 0.3);

                for (let x = 0; x <= canvas.width; x += 5) {
                    const y = canvas.height * 0.3 +
                        Math.sin(x * 0.003 + time + layer.offset) * 80 +
                        Math.sin(x * 0.007 + time * 1.5 + layer.offset) * 40 +
                        Math.cos(x * 0.002 + time * 0.5) * 60;

                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, 0);
                ctx.lineTo(0, 0);
                ctx.closePath();

                // Gradient fill
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
                gradient.addColorStop(0, "transparent");
                gradient.addColorStop(0.5, layer.color);
                gradient.addColorStop(1, "transparent");

                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Add shimmering particles
            for (let i = 0; i < 20; i++) {
                const x = (Math.sin(time * 2 + i * 0.5) * 0.5 + 0.5) * canvas.width;
                const y = canvas.height * 0.1 + Math.sin(time + i) * canvas.height * 0.2;
                const size = Math.sin(time * 3 + i) * 2 + 2;
                const alpha = Math.sin(time * 2 + i) * 0.5 + 0.5;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(150, 255, 200, ${alpha * 0.3})`;
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none opacity-60"
        />
    );
}
