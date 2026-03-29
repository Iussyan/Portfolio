"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tacticalAudio } from "@v2/lib/sounds";

interface Asteroid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: "NORMAL" | "FAST" | "TANK";
  points: number;
}

export const TargetScannerGame = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);
  const nextId = useRef(0);
  const initialHighScore = useRef(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("target_scanner_highscore");
    if (saved) {
      const parsed = parseInt(saved, 10);
      setHighScore(parsed);
      initialHighScore.current = parsed;
    }
  }, []);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("target_scanner_highscore", score.toString());
    }
  }, [score, highScore]);

  const spawnAsteroid = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();

    // Spawn from edges
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    const randType = Math.random();
    let type: "NORMAL" | "FAST" | "TANK" = "NORMAL";
    let speedMult = 1;
    let sizeMult = 1;
    let points = 10;

    if (randType > 0.85) { // 15% chance for a Tank
      type = "TANK";
      speedMult = 0.5;
      sizeMult = 2;
      points = 30;
    } else if (randType > 0.6) { // 25% chance for Fast
      type = "FAST";
      speedMult = 2;
      sizeMult = 0.6;
      points = 20;
    }

    const speed = (0.5 + Math.random() * 1.5) * speedMult;

    if (side === 0) { // Top
      x = Math.random() * width;
      y = -20;
      vx = (Math.random() - 0.5) * speed;
      vy = speed;
    } else if (side === 1) { // Right
      x = width + 20;
      y = Math.random() * height;
      vx = -speed;
      vy = (Math.random() - 0.5) * speed;
    } else if (side === 2) { // Bottom
      x = Math.random() * width;
      y = height + 20;
      vx = (Math.random() - 0.5) * speed;
      vy = -speed;
    } else { // Left
      x = -20;
      y = Math.random() * height;
      vx = speed;
      vy = (Math.random() - 0.5) * speed;
    }

    const newAsteroid: Asteroid = {
      id: nextId.current++,
      x,
      y,
      vx,
      vy,
      size: (15 + Math.random() * 25) * sizeMult,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      type,
      points,
    };

    setAsteroids(prev => [...prev, newAsteroid]);
  }, []);

  const update = useCallback((time: number) => {
    if (gameState !== "playing") return;

    // Spawn asteroids
    if (time - lastSpawnTime.current > Math.max(1500 - score * 5, 500)) {
      spawnAsteroid();
      lastSpawnTime.current = time;
    }

    setAsteroids(prev => {
      if (!containerRef.current) return prev;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      let hitCore = false;

      const nextAsteroids = prev
        .map(a => ({
          ...a,
          x: a.x + a.vx,
          y: a.y + a.vy,
          rotation: a.rotation + a.rotationSpeed,
        }))
        .filter(a => {
          // Check if it hit the center core
          const coreRadius = width * 0.02;
          const dist = Math.sqrt(Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2));

          // Collision: distance between centers < sum of radius
          if (dist < coreRadius + a.size / 2) {
            hitCore = true;
            return false;
          }
          // Keep asteroids within bounds
          return a.x > -100 && a.x < width + 100 && a.y > -100 && a.y < height + 100;
        });

      if (hitCore) {
        setGameState("gameover");
        tacticalAudio?.error();
      }

      return nextAsteroids;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, score, spawnAsteroid]);

  useEffect(() => {
    if (gameState === "playing") {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, update]);

  const startGame = () => {
    setScore(0);
    setAsteroids([]);
    setGameState("playing");
    initialHighScore.current = highScore;
    tacticalAudio?.comms();
  };

  const handleShoot = (e: React.PointerEvent, asteroidId: number) => {
    e.stopPropagation();
    if (gameState !== "playing") return;

    const hitAsteroid = asteroids.find(a => a.id === asteroidId);
    if (hitAsteroid) {
      setScore(s => s + hitAsteroid.points);
    }
    setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    tacticalAudio?.blip();
  };

  const handleMiss = () => {
    if (gameState !== "playing") return;
    tacticalAudio?.click();
  };

  return (
    <motion.div
      ref={containerRef}
      animate={gameState === "gameover" ? { x: [-8, 8, -8, 8, -4, 4, 0], y: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`surface-low p-6 aspect-square relative flex items-center justify-center overflow-hidden group ${gameState === "playing" ? "cursor-crosshair" : "cursor-default"}`}
      onClick={handleMiss}
    >
      {/* Background Scanner Grid */}
      <div className="absolute inset-0 opacity-10 border border-secondary pointer-events-none" />
      <div className="w-full h-full border border-secondary/10 absolute animate-pulse pointer-events-none" />

      <div className="relative w-3/4 h-3/4 border border-secondary/20 rounded-full flex items-center justify-center pointer-events-none">
        <div className="w-1/2 h-1/2 border border-secondary/30 rounded-full animate-ping opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-secondary/10" />
          <div className="h-full w-px bg-secondary/10" />
        </div>
      </div>

      {/* Visible Center Core */}
      <div className="absolute w-[2.5%] h-[2.5%] border border-secondary/50 bg-secondary/20 rounded-full flex items-center justify-center pointer-events-none z-10">
        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
      </div>

      {/* Game Content */}
      <AnimatePresence>
        {asteroids.map(asteroid => (
          <motion.div
            key={asteroid.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute pointer-events-auto"
            style={{
              left: asteroid.x,
              top: asteroid.y,
              width: asteroid.size,
              height: asteroid.size,
              marginLeft: -asteroid.size / 2,
              marginTop: -asteroid.size / 2,
              transform: `rotate(${asteroid.rotation}deg)`
            }}
            onPointerDown={(e) => handleShoot(e, asteroid.id)}
          >
            {/* Asteroid Visual (Tactical HUD style) */}
            <div className={`w-full h-full border-2 flex items-center justify-center transition-colors ${asteroid.type === "FAST" ? "border-secondary/60 bg-secondary/5 hover:bg-secondary/20" :
              asteroid.type === "TANK" ? "border-tertiary/60 bg-tertiary/5 hover:bg-tertiary/20" :
                "border-primary/60 bg-primary/5 hover:bg-primary/20"
              }`}>
              <div className={`w-1/2 h-1/2 border rotate-45 ${asteroid.type === "FAST" ? "border-secondary/40" :
                asteroid.type === "TANK" ? "border-tertiary/40" :
                  "border-primary/40"
                }`} />
            </div>
            {/* Target identifier */}
            <div className={`absolute -top-4 -right-4 text-[8px] font-mono font-bold ${asteroid.type === "FAST" ? "text-secondary" :
              asteroid.type === "TANK" ? "text-tertiary" :
                "text-primary"
              }`}>
              ID_{asteroid.id.toString(16).toUpperCase()}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* UI Overlays */}
      <div className="absolute top-2 left-2 flex flex-col gap-0 pointer-events-none">
        <span className="text-[11px] font-mono text-primary font-bold leading-none">SCORE: {score.toString().padStart(6, '0')}</span>
        <span className="text-[10px] font-mono text-on-surface-muted italic leading-none">HIGH: {highScore.toString().padStart(6, '0')}</span>
      </div>

      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-on-surface-muted italic pointer-events-none">
        ASTEROID_CRUSHER_V1.0
      </div>

      {/* Start/GameOver Screen */}
      {gameState !== "playing" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-surface/60 backdrop-blur-sm p-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 items-center"
          >
            <div className="text-primary font-bold tracking-widest text-sm uppercase">
              {gameState === "idle" ? "Integrity Defenders" : "Targeting Failure"}
            </div>

            {gameState === "gameover" && (
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="text-4xl font-bold text-on-surface tracking-tighter">
                  {score}
                </div>
                {score > 0 && score > initialHighScore.current && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: [1.2, 1], y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="text-secondary text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-secondary/10 border border-secondary/50 animate-pulse"
                  >
                    New Record Established
                  </motion.div>
                )}
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-surface transition-all font-mono text-xs font-bold uppercase tracking-widest"
            >
              {gameState === "idle" ? "Crush Asteroids" : "Restart Sequence"}
            </button>

            <p className="text-xs text-on-surface-muted mt-2 max-w-[220px]">
              Engage incoming asteroids to maintain infrastructure integrity. <br /><br /> Prevent any targets from reaching the center core.
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
