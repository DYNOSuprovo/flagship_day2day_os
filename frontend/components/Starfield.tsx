"use client";

import { useEffect, useRef } from "react";

interface Star {
    x: number;
    y: number;
    z: number;
    pz: number;
}

export default function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        const stars: Star[] = [];
        const numStars = 400;
        const speed = 2;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            stars.length = 0;
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width,
                    pz: 0
                });
            }
        };

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            for (const star of stars) {
                star.pz = star.z;
                star.z -= speed;

                if (star.z <= 0) {
                    star.x = Math.random() * canvas.width - cx;
                    star.y = Math.random() * canvas.height - cy;
                    star.z = canvas.width;
                    star.pz = star.z;
                }

                const sx = (star.x / star.z) * canvas.width + cx;
                const sy = (star.y / star.z) * canvas.height + cy;
                const px = (star.x / star.pz) * canvas.width + cx;
                const py = (star.y / star.pz) * canvas.height + cy;

                const size = (1 - star.z / canvas.width) * 3;
                const brightness = 1 - star.z / canvas.width;

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.lineWidth = size;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };

        init();
        window.addEventListener("resize", init);
        draw();

        return () => {
            window.removeEventListener("resize", init);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
        />
    );
}
