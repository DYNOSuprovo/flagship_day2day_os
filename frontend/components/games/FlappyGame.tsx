"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlappyGameProps {
    onGameEnd?: (score: number) => void;
}

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const BIRD_SIZE = 30;

export default function FlappyGame({ onGameEnd }: FlappyGameProps) {
    const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [birdY, setBirdY] = useState(250);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState<{ x: number; gapY: number; passed: boolean }[]>([]);

    const gameRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number>();

    useEffect(() => {
        const saved = localStorage.getItem("flappy_high_score");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const jump = useCallback(() => {
        if (gameState === "idle") {
            setGameState("playing");
            setBirdVelocity(JUMP_FORCE);
        } else if (gameState === "playing") {
            setBirdVelocity(JUMP_FORCE);
        }
    }, [gameState]);

    const reset = () => {
        setGameState("idle");
        setScore(0);
        setBirdY(250);
        setBirdVelocity(0);
        setPipes([]);
    };

    // Game loop
    useEffect(() => {
        if (gameState !== "playing") return;

        const gameLoop = () => {
            // Update bird
            setBirdVelocity(v => v + GRAVITY);
            setBirdY(y => {
                const newY = y + birdVelocity;

                // Floor/ceiling collision
                if (newY < 0 || newY > 500 - BIRD_SIZE) {
                    setGameState("dead");
                    if (score > highScore) {
                        setHighScore(score);
                        localStorage.setItem("flappy_high_score", score.toString());
                    }
                    onGameEnd?.(score);
                    return y;
                }

                return newY;
            });

            // Update pipes
            setPipes(currentPipes => {
                let newPipes = currentPipes
                    .map(pipe => ({ ...pipe, x: pipe.x - 3 }))
                    .filter(pipe => pipe.x > -PIPE_WIDTH);

                // Add new pipe
                if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 250) {
                    newPipes.push({
                        x: 400,
                        gapY: 100 + Math.random() * 250,
                        passed: false
                    });
                }

                // Check collisions and scoring
                newPipes = newPipes.map(pipe => {
                    const birdLeft = 50;
                    const birdRight = 50 + BIRD_SIZE;
                    const birdTop = birdY;
                    const birdBottom = birdY + BIRD_SIZE;

                    const pipeLeft = pipe.x;
                    const pipeRight = pipe.x + PIPE_WIDTH;

                    // Collision detection
                    if (birdRight > pipeLeft && birdLeft < pipeRight) {
                        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
                            setGameState("dead");
                            if (score > highScore) {
                                setHighScore(score);
                                localStorage.setItem("flappy_high_score", score.toString());
                            }
                            onGameEnd?.(score);
                        }
                    }

                    // Score
                    if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
                        setScore(s => s + 1);
                        return { ...pipe, passed: true };
                    }

                    return pipe;
                });

                return newPipes;
            });

            frameRef.current = requestAnimationFrame(gameLoop);
        };

        frameRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [gameState, birdVelocity, birdY, score, highScore, onGameEnd]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                jump();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jump]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Score display */}
            <div className="flex items-center gap-6 text-lg">
                <div>
                    <span className="text-neutral-400">Score: </span>
                    <span className="font-bold text-2xl">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500 font-bold">{highScore}</span>
                </div>
            </div>

            {/* Game canvas */}
            <div
                ref={gameRef}
                onClick={jump}
                className="relative w-[400px] h-[500px] bg-gradient-to-b from-sky-400 to-sky-600 rounded-xl overflow-hidden cursor-pointer border-4 border-neutral-700"
            >
                {/* Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-700 to-amber-600" />

                {/* Pipes */}
                {pipes.map((pipe, i) => (
                    <div key={i}>
                        {/* Top pipe */}
                        <div
                            className="absolute bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700"
                            style={{
                                left: pipe.x,
                                top: 0,
                                width: PIPE_WIDTH,
                                height: pipe.gapY
                            }}
                        >
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-green-700" />
                        </div>
                        {/* Bottom pipe */}
                        <div
                            className="absolute bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700"
                            style={{
                                left: pipe.x,
                                top: pipe.gapY + PIPE_GAP,
                                width: PIPE_WIDTH,
                                bottom: 48
                            }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-6 bg-green-700" />
                        </div>
                    </div>
                ))}

                {/* Bird */}
                <motion.div
                    animate={{
                        y: birdY,
                        rotate: Math.min(birdVelocity * 3, 90)
                    }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-[50px] w-[30px] h-[30px]"
                >
                    <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                        <div className="w-2 h-2 bg-black rounded-full absolute right-1 top-2" />
                        <div className="absolute -right-2 w-3 h-2 bg-orange-500 rounded-r" />
                    </div>
                </motion.div>

                {/* Overlays */}
                {gameState === "idle" && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4">🐤</div>
                        <div className="text-white text-xl font-bold mb-2">Focus Flappy</div>
                        <div className="text-white/70 text-sm mb-4">Click or press Space to jump</div>
                        <button
                            onClick={jump}
                            className="px-6 py-3 bg-green-500 rounded-xl font-bold flex items-center gap-2 hover:bg-green-400"
                        >
                            <Play className="w-5 h-5" /> Start
                        </button>
                    </div>
                )}

                {gameState === "dead" && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4">💀</div>
                        <div className="text-white text-xl font-bold mb-2">Game Over!</div>
                        <div className="text-3xl font-bold text-yellow-400 mb-4">Score: {score}</div>
                        {score > 0 && (
                            <div className="text-green-400 text-sm mb-4">+{Math.min(score * 10, 50)} XP earned!</div>
                        )}
                        <button
                            onClick={reset}
                            className="px-6 py-3 bg-purple-500 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-400"
                        >
                            <RotateCcw className="w-5 h-5" /> Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
