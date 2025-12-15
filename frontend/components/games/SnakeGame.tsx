"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

interface SnakeGameProps {
    onGameEnd?: (score: number) => void;
}

export default function SnakeGame({ onGameEnd }: SnakeGameProps) {
    const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Position>({ x: 15, y: 10 });
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);

    const directionRef = useRef<Direction>("RIGHT");
    const gameLoopRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        const saved = localStorage.getItem("snake_high_score");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const generateFood = useCallback((snakeBody: Position[]): Position => {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (snakeBody.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        return newFood;
    }, []);

    const startGame = () => {
        setGameState("playing");
        setSnake([{ x: 10, y: 10 }]);
        setDirection("RIGHT");
        directionRef.current = "RIGHT";
        setScore(0);
        setSpeed(INITIAL_SPEED);
        setFood(generateFood([{ x: 10, y: 10 }]));
    };

    const endGame = useCallback((finalScore: number) => {
        setGameState("dead");
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem("snake_high_score", finalScore.toString());
        }
        onGameEnd?.(finalScore);
    }, [highScore, onGameEnd]);

    // Game loop
    useEffect(() => {
        if (gameState !== "playing") return;

        gameLoopRef.current = setInterval(() => {
            setSnake(currentSnake => {
                const head = { ...currentSnake[0] };

                switch (directionRef.current) {
                    case "UP": head.y -= 1; break;
                    case "DOWN": head.y += 1; break;
                    case "LEFT": head.x -= 1; break;
                    case "RIGHT": head.x += 1; break;
                }

                // Wall collision
                if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                    endGame(score);
                    return currentSnake;
                }

                // Self collision
                if (currentSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
                    endGame(score);
                    return currentSnake;
                }

                const newSnake = [head, ...currentSnake];

                // Check food
                if (head.x === food.x && head.y === food.y) {
                    setScore(s => s + 1);
                    setFood(generateFood(newSnake));
                    // Speed up
                    setSpeed(s => Math.max(50, s - 5));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, speed);

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameState, speed, food, score, generateFood, endGame]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== "playing") return;

            const key = e.key;
            if (key === "ArrowUp" && directionRef.current !== "DOWN") {
                directionRef.current = "UP";
                setDirection("UP");
            } else if (key === "ArrowDown" && directionRef.current !== "UP") {
                directionRef.current = "DOWN";
                setDirection("DOWN");
            } else if (key === "ArrowLeft" && directionRef.current !== "RIGHT") {
                directionRef.current = "LEFT";
                setDirection("LEFT");
            } else if (key === "ArrowRight" && directionRef.current !== "LEFT") {
                directionRef.current = "RIGHT";
                setDirection("RIGHT");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState]);

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

            {/* Game grid */}
            <div
                className="relative bg-neutral-900 rounded-xl border-4 border-neutral-700"
                style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE
                }}
            >
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: GRID_SIZE }).map((_, i) => (
                        <div
                            key={`h-${i}`}
                            className="absolute left-0 right-0 border-b border-white"
                            style={{ top: i * CELL_SIZE }}
                        />
                    ))}
                    {Array.from({ length: GRID_SIZE }).map((_, i) => (
                        <div
                            key={`v-${i}`}
                            className="absolute top-0 bottom-0 border-r border-white"
                            style={{ left: i * CELL_SIZE }}
                        />
                    ))}
                </div>

                {/* Snake */}
                {snake.map((segment, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute rounded ${i === 0 ? "bg-green-400" : "bg-green-600"}`}
                        style={{
                            left: segment.x * CELL_SIZE + 1,
                            top: segment.y * CELL_SIZE + 1,
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2
                        }}
                    >
                        {i === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                                {direction === "UP" ? "▲" : direction === "DOWN" ? "▼" : direction === "LEFT" ? "◀" : "▶"}
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Food */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute bg-red-500 rounded-full flex items-center justify-center text-sm"
                    style={{
                        left: food.x * CELL_SIZE + 2,
                        top: food.y * CELL_SIZE + 2,
                        width: CELL_SIZE - 4,
                        height: CELL_SIZE - 4
                    }}
                >
                    🍎
                </motion.div>

                {/* Overlays */}
                {gameState === "idle" && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl">
                        <div className="text-4xl mb-4">🐍</div>
                        <div className="text-white text-xl font-bold mb-2">Habit Snake</div>
                        <div className="text-white/70 text-sm mb-4">Use arrow keys to move</div>
                        <button
                            onClick={startGame}
                            className="px-6 py-3 bg-green-500 rounded-xl font-bold flex items-center gap-2 hover:bg-green-400"
                        >
                            <Play className="w-5 h-5" /> Start
                        </button>
                    </div>
                )}

                {gameState === "dead" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl">
                        <div className="text-4xl mb-4">💀</div>
                        <div className="text-white text-xl font-bold mb-2">Game Over!</div>
                        <div className="text-3xl font-bold text-yellow-400 mb-4">Score: {score}</div>
                        {score > 0 && (
                            <div className="text-green-400 text-sm mb-4">+{Math.min(score * 5, 30)} XP earned!</div>
                        )}
                        <button
                            onClick={startGame}
                            className="px-6 py-3 bg-purple-500 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-400"
                        >
                            <RotateCcw className="w-5 h-5" /> Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile controls */}
            <div className="grid grid-cols-3 gap-2 md:hidden">
                <div />
                <button
                    onClick={() => { if (directionRef.current !== "DOWN") { directionRef.current = "UP"; setDirection("UP"); } }}
                    className="p-4 bg-neutral-800 rounded-xl"
                >
                    <ArrowUp className="w-6 h-6 mx-auto" />
                </button>
                <div />
                <button
                    onClick={() => { if (directionRef.current !== "RIGHT") { directionRef.current = "LEFT"; setDirection("LEFT"); } }}
                    className="p-4 bg-neutral-800 rounded-xl"
                >
                    <ArrowLeft className="w-6 h-6 mx-auto" />
                </button>
                <button
                    onClick={() => { if (directionRef.current !== "UP") { directionRef.current = "DOWN"; setDirection("DOWN"); } }}
                    className="p-4 bg-neutral-800 rounded-xl"
                >
                    <ArrowDown className="w-6 h-6 mx-auto" />
                </button>
                <button
                    onClick={() => { if (directionRef.current !== "LEFT") { directionRef.current = "RIGHT"; setDirection("RIGHT"); } }}
                    className="p-4 bg-neutral-800 rounded-xl"
                >
                    <ArrowRight className="w-6 h-6 mx-auto" />
                </button>
            </div>
        </div>
    );
}
