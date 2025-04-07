"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = "RIGHT";
const INITIAL_FOOD = { x: 15, y: 10 };
const INITIAL_GAME_SPEED = 150; // milliseconds
const SPEED_INCREMENT = 5; // milliseconds to reduce per food eaten

const Snake: NextPage = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);
  const [transactions, setTransactions] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food position
  const generateFood = useCallback(async () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    try {
      await fetch("/api/relayer/increment", {
        method: "POST",
      });
      // Increment transaction counter when API call succeeds
      setTransactions(prev => prev + 1);
    } catch (error) {
      console.error("Transaction failed:", error);
    }

    // Make sure food doesn't spawn on snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (isOnSnake) {
      return generateFood();
    }

    return newFood;
  }, [snake]);

  // Handle keyboard input
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault(); // Prevent scrolling
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          e.preventDefault(); // Prevent scrolling
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          e.preventDefault(); // Prevent scrolling
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          e.preventDefault(); // Prevent scrolling
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        case " ": // Space bar to pause/resume
          e.preventDefault(); // Prevent scrolling
          setIsPaused(prev => !prev);
          break;
        case "r": // 'r' key to restart
          if (gameOver) restartGame();
          break;
        default:
          break;
      }
    },
    [direction, gameOver],
  );

  // Game loop
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      // Create new head based on direction
      const head = { ...prevSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          if (head.y < 0) head.y = GRID_SIZE - 1; // Wrap around top edge
          break;
        case "DOWN":
          head.y += 1;
          if (head.y >= GRID_SIZE) head.y = 0; // Wrap around bottom edge
          break;
        case "LEFT":
          head.x -= 1;
          if (head.x < 0) head.x = GRID_SIZE - 1; // Wrap around left edge
          break;
        case "RIGHT":
          head.x += 1;
          if (head.x >= GRID_SIZE) head.x = 0; // Wrap around right edge
          break;
        default:
          break;
      }

      // Check for collisions with self
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      // Check if snake ate food
      const newSnake = [head, ...prevSnake];
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        // Fix linter error by handling the Promise properly
        generateFood().then(newFood => {
          setFood(newFood);
        });
        // Increase snake speed by reducing interval time
        setGameSpeed(prevSpeed => Math.max(40, prevSpeed - SPEED_INCREMENT));
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [direction, food, gameOver, generateFood, isPaused]);

  // Restart game
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameSpeed(INITIAL_GAME_SPEED);
    setTransactions(0);
  };

  // Set up game loop and keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Clear previous interval if it exists
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, gameSpeed);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [handleKeyDown, moveSnake, gameOver, isPaused, gameSpeed]);

  // Render game grid
  const renderGrid = () => {
    const grid = [];

    // Create grid cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        const isHead = snake[0].x === x && snake[0].y === y;

        let cellClass = "bg-gray-800";
        if (isHead) {
          cellClass = "bg-green-500";
        } else if (isSnake) {
          cellClass = "bg-green-400";
        } else if (isFood) {
          cellClass = "bg-red-500";
        }

        grid.push(
          <div
            key={`${x}-${y}`}
            className={`absolute ${cellClass}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
            }}
          />,
        );
      }
    }

    return grid;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-white mb-4">Snake Game</h1>

      <div className="mb-4 flex gap-4">
        <div className="stat bg-base-200 shadow">
          <div className="stat-title">Score</div>
          <div className="stat-value">{score}</div>
        </div>
        <div className="stat bg-base-200 shadow">
          <div className="stat-title">Transactions</div>
          <div className="stat-value">{transactions}</div>
          <div className="stat-desc">One per food eaten</div>
        </div>
      </div>

      <div
        className="relative border-2 border-gray-700 bg-gray-800"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {renderGrid()}

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-xl text-white mb-4">Final Score: {score}</p>
            <p className="text-xl text-white mb-4">Transactions Made: {transactions}</p>
            <button className="btn btn-primary" onClick={restartGame}>
              Play Again
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <h2 className="text-3xl font-bold text-white">Paused</h2>
          </div>
        )}
      </div>

      <div className="mt-6 text-white text-center">
        <p className="mb-2">Use arrow keys to move</p>
        <p className="mb-2">Press Space to pause/resume</p>
        <p>Press R to restart after game over</p>
      </div>
    </div>
  );
};

export default Snake;
