"use client";

import { useEffect, useRef } from "react";

export default function MorphingBlobs() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const blobs = [
            { x: 0.3, y: 0.4, radius: 200, color: "rgba(139, 92, 246, 0.3)", speed: 0.002 },
            { x: 0.7, y: 0.6, radius: 180, color: "rgba(59, 130, 246, 0.25)", speed: 0.0015 },
            { x: 0.5, y: 0.3, radius: 150, color: "rgba(236, 72, 153, 0.2)", speed: 0.0025 },
            { x: 0.2, y: 0.7, radius: 120, color: "rgba(16, 185, 129, 0.2)", speed: 0.002 },
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawBlob = (
            centerX: number,
            centerY: number,
            radius: number,
            color: string,
            phase: number
        ) => {
            ctx.beginPath();

            const points = 6;
            const angleStep = (Math.PI * 2) / points;

            for (let i = 0; i <= points; i++) {
                const angle = i * angleStep;
                const noise1 = Math.sin(angle * 2 + phase) * 0.3;
                const noise2 = Math.cos(angle * 3 + phase * 1.5) * 0.2;
                const r = radius * (1 + noise1 + noise2);

                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevAngle = (i - 1) * angleStep;
                    const prevNoise1 = Math.sin(prevAngle * 2 + phase) * 0.3;
                    const prevNoise2 = Math.cos(prevAngle * 3 + phase * 1.5) * 0.2;
                    const prevR = radius * (1 + prevNoise1 + prevNoise2);

                    const cpX = centerX + Math.cos((angle + prevAngle) / 2) * (r + prevR) / 1.5;
                    const cpY = centerY + Math.sin((angle + prevAngle) / 2) * (r + prevR) / 1.5;

                    ctx.quadraticCurveTo(cpX, cpY, x, y);
                }
            }

            ctx.closePath();
            ctx.fillStyle = color;
            ctx.filter = "blur(40px)";
            ctx.fill();
            ctx.filter = "none";
        };

        const animate = () => {
            time += 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            blobs.forEach((blob, i) => {
                const offsetX = Math.sin(time * blob.speed + i) * 50;
                const offsetY = Math.cos(time * blob.speed * 0.8 + i) * 30;

                drawBlob(
                    blob.x * canvas.width + offsetX,
                    blob.y * canvas.height + offsetY,
                    blob.radius,
                    blob.color,
                    time * blob.speed
                );
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener("resize", resize);
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    );
}
