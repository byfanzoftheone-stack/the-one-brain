import { useRef, useEffect, useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Ball, GameState } from "@/types/game";
import { Button } from "@/components/ui/button";

interface PoolTableProps {
  gameState: GameState | null;
  currentUserId: string;
  onPocketBall: (ballId: number) => void;
  onStartPractice: () => void;
  playerNames: { [uid: string]: string };
}

export function PoolTable({ gameState, currentUserId, onPocketBall, onStartPractice, playerNames }: PoolTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBall, setHoveredBall] = useState<number | null>(null);

  useEffect(() => {
    drawCanvas();
  }, [gameState, hoveredBall]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw table background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#006400");
    gradient.addColorStop(1, "#228B22");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw table border
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, width - 8, height - 8);
    
    // Draw pockets
    const pocketRadius = 20;
    const pockets = [
      { x: 20, y: 20 }, // top-left
      { x: width - 20, y: 20 }, // top-right
      { x: 20, y: height - 20 }, // bottom-left
      { x: width - 20, y: height - 20 }, // bottom-right
      { x: width / 2, y: 20 }, // top-middle
      { x: width / 2, y: height - 20 }, // bottom-middle
    ];
    
    pockets.forEach(pocket => {
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocketRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
    });

    if (!gameState?.board) return;

    // Draw balls
    gameState.board.forEach((ball, index) => {
      if (ball.pocketed) return;
      
      const ballX = 80 + index * 45;
      const ballY = height / 2;
      const ballRadius = 15;
      
      // Ball shadow
      ctx.beginPath();
      ctx.arc(ballX + 2, ballY + 2, ballRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fill();
      
      // Ball body
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
      
      // Different colors for different balls
      const ballColors = [
        "#FFFF00", "#0000FF", "#FF0000", "#800080", "#FFA500", 
        "#008000", "#800000", "#000000", "#FFFF00", "#0000FF",
        "#FF0000", "#800080", "#FFA500", "#008000", "#800000"
      ];
      
      ctx.fillStyle = ball.id <= 8 ? ballColors[ball.id - 1] : "#FFF";
      ctx.fill();
      
      // Ball border
      ctx.strokeStyle = hoveredBall === ball.id ? "#FFF" : "#333";
      ctx.lineWidth = hoveredBall === ball.id ? 3 : 2;
      ctx.stroke();
      
      // Ball number
      ctx.fillStyle = ball.id <= 8 && ball.id !== 8 ? "#FFF" : "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ball.id.toString(), ballX, ballY);
      
      // Hover effect
      if (hoveredBall === ball.id) {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Draw cue ball
    const cueBallX = 40;
    const cueBallY = height / 2;
    const cueBallRadius = 15;
    
    ctx.beginPath();
    ctx.arc(cueBallX, cueBallY, cueBallRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.strokeStyle = "#DDD";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState || gameState.turn !== currentUserId || gameState.state !== 'in-progress') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    gameState.board.forEach((ball, index) => {
      if (ball.pocketed) return;
      
      const ballX = 80 + index * 45;
      const ballY = canvas.height / 2;
      const distance = Math.sqrt((clickX - ballX) ** 2 + (clickY - ballY) ** 2);
      
      if (distance <= 20) {
        onPocketBall(ball.id);
      }
    });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState?.board) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    let foundHoveredBall = null;
    
    gameState.board.forEach((ball, index) => {
      if (ball.pocketed) return;
      
      const ballX = 80 + index * 45;
      const ballY = canvas.height / 2;
      const distance = Math.sqrt((mouseX - ballX) ** 2 + (mouseY - ballY) ** 2);
      
      if (distance <= 20) {
        foundHoveredBall = ball.id;
      }
    });
    
    setHoveredBall(foundHoveredBall);
  };

  const getCurrentPlayerName = () => {
    if (!gameState?.turn) return "Unknown";
    return gameState.turn === currentUserId ? "You" : (playerNames[gameState.turn] || "Opponent");
  };

  const getOpponentName = () => {
    if (!gameState?.players) return "Unknown";
    const opponent = gameState.players.find(p => p !== currentUserId);
    return opponent ? (playerNames[opponent] || "Opponent") : "Unknown";
  };

  const ballsRemaining = gameState?.board.filter(ball => !ball.pocketed).length || 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-gamepad text-white"></i>
          </div>
          <div>
            <h2 className="font-space font-bold text-xl">8-Ball Match</h2>
            <p className="text-gray-400 text-sm">
              {gameState ? 'Current game in progress' : 'No active game'}
            </p>
          </div>
        </div>
        {!gameState && (
          <Button
            onClick={onStartPractice}
            className="glass-morphism px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all"
            data-testid="button-start-practice"
          >
            <i className="fas fa-plus mr-2"></i>Practice Solo
          </Button>
        )}
      </div>

      <GlassmorphicCard>
        {gameState ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="font-bold text-white text-xs">
                      {playerNames[currentUserId]?.split(' ').map(n => n[0]).join('') || 'ME'}
                    </span>
                  </div>
                  <span className="font-semibold">You</span>
                </div>
                {gameState.players.length > 1 && (
                  <>
                    <span className="text-gray-400">vs</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-xs">
                          {getOpponentName().split(' ').map(n => n[0]).join('') || 'OP'}
                        </span>
                      </div>
                      <span className="font-semibold">{getOpponentName()}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  gameState.turn === currentUserId 
                    ? 'bg-green-500 bg-opacity-20 text-green-400' 
                    : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                }`} data-testid="turn-indicator">
                  {gameState.state === 'finished' 
                    ? (gameState.winner === currentUserId ? 'You Won!' : 'You Lost') 
                    : (gameState.turn === currentUserId ? 'Your Turn' : `${getCurrentPlayerName()}'s Turn`)
                  }
                </div>
              </div>
            </div>

            <div className="pool-table-bg rounded-xl p-6 mb-4 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-auto cursor-pointer"
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoveredBall(null)}
                data-testid="pool-table-canvas"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <span data-testid="game-id">Game ID: #{gameState.id.slice(-6)}</span>
              <span>
                {gameState.turn === currentUserId && gameState.state === 'in-progress' 
                  ? 'Click balls to pocket them' 
                  : 'Wait for your turn'
                }
              </span>
              <span data-testid="balls-remaining">Balls remaining: {ballsRemaining}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-gamepad text-gray-400 text-2xl"></i>
            </div>
            <h3 className="font-semibold text-lg mb-2">No Active Game</h3>
            <p className="text-gray-400 mb-4">Start a practice game or challenge a player to begin</p>
            <Button
              onClick={onStartPractice}
              className="bg-primary hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all"
              data-testid="button-start-practice-empty"
            >
              Start Practice Game
            </Button>
          </div>
        )}
      </GlassmorphicCard>
    </section>
  );
}
