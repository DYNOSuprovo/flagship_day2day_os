"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;

        const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const charArray = chars.split("");

        let fontSize = 14;
        let columns: number;
        let drops: number[];

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = Array(columns).fill(1);
        };

        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Green text
            ctx.fillStyle = "#0F0";
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = charArray[Math.floor(Math.random() * charArray.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Gradient effect - brighter at the front
                const brightness = Math.random();
                if (brightness > 0.98) {
                    ctx.fillStyle = "#FFF"; // White flash
                } else if (brightness > 0.9) {
                    ctx.fillStyle = "#AFA"; // Light green
                } else {
                    ctx.fillStyle = "#0F0"; // Normal green
                }

                ctx.fillText(char, x, y);

                // Reset drop to top with random delay
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
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
            className="fixed inset-0 -z-10 pointer-events-none opacity-30"
        />
    );
}
