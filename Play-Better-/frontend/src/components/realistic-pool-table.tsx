import { useRef, useEffect, useState, useCallback } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Ball, GameState, CueStick } from "@/types/game";
import { Button } from "@/components/ui/button";

interface RealisticPoolTableProps {
  gameState: GameState | null;
  currentUserId: string;
  onGameUpdate: (gameState: GameState) => void;
  onStartPractice: () => void;
  playerNames: { [uid: string]: string };
}

const BALL_RADIUS = 12;
const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
const FRICTION = 0.98;
const MIN_VELOCITY = 0.1;

export function RealisticPoolTable({ 
  gameState, 
  currentUserId, 
  onGameUpdate, 
  onStartPractice, 
  playerNames 
}: RealisticPoolTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isAiming, setIsAiming] = useState(false);
  const [aimStart, setAimStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [pullDistance, setPullDistance] = useState(0);

  // Initialize balls in rack formation
  const initializeBalls = useCallback((): Ball[] => {
    const balls: Ball[] = [];
    
    // Standard 8-ball rack formation
    const rackCenterX = TABLE_WIDTH * 0.75;
    const rackCenterY = TABLE_HEIGHT * 0.5;
    const ballSpacing = BALL_RADIUS * 2.1;
    
    const rackPositions = [
      { x: 0, y: 0 }, // 1 ball (front - pointing toward cue ball)
      { x: ballSpacing, y: -ballSpacing * 0.5 }, // 2nd row left
      { x: ballSpacing, y: ballSpacing * 0.5 }, // 2nd row right
      { x: ballSpacing * 2, y: -ballSpacing }, // 3rd row
      { x: ballSpacing * 2, y: 0 }, // 3rd row center (8-ball)
      { x: ballSpacing * 2, y: ballSpacing }, // 3rd row
      { x: ballSpacing * 3, y: -ballSpacing * 1.5 }, // 4th row
      { x: ballSpacing * 3, y: -ballSpacing * 0.5 }, // 4th row
      { x: ballSpacing * 3, y: ballSpacing * 0.5 }, // 4th row
      { x: ballSpacing * 3, y: ballSpacing * 1.5 }, // 4th row
      { x: ballSpacing * 4, y: -ballSpacing * 2 }, // 5th row (back of rack)
      { x: ballSpacing * 4, y: -ballSpacing }, // 5th row
      { x: ballSpacing * 4, y: 0 }, // 5th row
      { x: ballSpacing * 4, y: ballSpacing }, // 5th row
      { x: ballSpacing * 4, y: ballSpacing * 2 }, // 5th row
    ];

    const ballColors = [
      "#FFFF00", "#0000FF", "#FF0000", "#800080", "#FFA500", 
      "#008000", "#800000", "#000000", "#FFFF00", "#0000FF",
      "#FF0000", "#800080", "#FFA500", "#008000", "#800000"
    ];

    rackPositions.forEach((pos, index) => {
      const ballId = index + 1;
      balls.push({
        id: ballId,
        x: rackCenterX + pos.x,
        y: rackCenterY + pos.y,
        vx: 0,
        vy: 0,
        pocketed: false,
        type: ballId === 8 ? '8ball' : ballId <= 7 ? 'solid' : 'stripe',
        color: ballColors[index]
      });
    });

    return balls;
  }, []);

  // Create cue ball
  const createCueBall = useCallback((): Ball => ({
    id: 0,
    x: TABLE_WIDTH * 0.25,
    y: TABLE_HEIGHT * 0.5,
    vx: 0,
    vy: 0,
    pocketed: false,
    type: 'cue',
    color: '#FFFFFF'
  }), []);

  // Physics simulation
  const updatePhysics = useCallback((balls: Ball[], cueBall: Ball) => {
    const allBalls = [cueBall, ...balls];
    let moving = false;

    // Update positions
    allBalls.forEach(ball => {
      if (Math.abs(ball.vx) > MIN_VELOCITY || Math.abs(ball.vy) > MIN_VELOCITY) {
        moving = true;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= FRICTION;
        ball.vy *= FRICTION;

        // Stop very slow balls
        if (Math.abs(ball.vx) < MIN_VELOCITY) ball.vx = 0;
        if (Math.abs(ball.vy) < MIN_VELOCITY) ball.vy = 0;
      }
    });

    // Wall collisions
    allBalls.forEach(ball => {
      if (ball.x - BALL_RADIUS < 40 || ball.x + BALL_RADIUS > TABLE_WIDTH - 40) {
        ball.vx = -ball.vx * 0.8;
        ball.x = Math.max(40 + BALL_RADIUS, Math.min(TABLE_WIDTH - 40 - BALL_RADIUS, ball.x));
      }
      if (ball.y - BALL_RADIUS < 40 || ball.y + BALL_RADIUS > TABLE_HEIGHT - 40) {
        ball.vy = -ball.vy * 0.8;
        ball.y = Math.max(40 + BALL_RADIUS, Math.min(TABLE_HEIGHT - 40 - BALL_RADIUS, ball.y));
      }
    });

    // Ball-to-ball collisions
    for (let i = 0; i < allBalls.length; i++) {
      for (let j = i + 1; j < allBalls.length; j++) {
        const ball1 = allBalls[i];
        const ball2 = allBalls[j];
        
        if (ball1.pocketed || ball2.pocketed) continue;

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < BALL_RADIUS * 2) {
          // Collision response
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          // Rotate ball positions
          const vx1 = ball1.vx * cos + ball1.vy * sin;
          const vy1 = ball1.vy * cos - ball1.vx * sin;
          const vx2 = ball2.vx * cos + ball2.vy * sin;
          const vy2 = ball2.vy * cos - ball2.vx * sin;

          // Update velocities
          ball1.vx = vx2 * cos - vy1 * sin;
          ball1.vy = vy1 * cos + vx2 * sin;
          ball2.vx = vx1 * cos - vy2 * sin;
          ball2.vy = vy2 * cos + vx1 * sin;

          // Separate balls
          const overlap = BALL_RADIUS * 2 - distance;
          const separateX = (overlap * cos) / 2;
          const separateY = (overlap * sin) / 2;
          
          ball1.x -= separateX;
          ball1.y -= separateY;
          ball2.x += separateX;
          ball2.y += separateY;
        }
      }
    }

    // Check for pocketed balls
    const pockets = [
      { x: 40, y: 40 },
      { x: TABLE_WIDTH - 40, y: 40 },
      { x: 40, y: TABLE_HEIGHT - 40 },
      { x: TABLE_WIDTH - 40, y: TABLE_HEIGHT - 40 },
      { x: TABLE_WIDTH / 2, y: 40 },
      { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 40 },
    ];

    allBalls.forEach(ball => {
      pockets.forEach(pocket => {
        const dx = ball.x - pocket.x;
        const dy = ball.y - pocket.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20 && !ball.pocketed) {
          if (ball.type === 'cue') {
            // Scratch — respawn cue ball immediately at baulk line
            ball.x = TABLE_WIDTH * 0.25;
            ball.y = TABLE_HEIGHT * 0.5;
            ball.vx = 0;
            ball.vy = 0;
          } else {
            ball.pocketed = true;
            ball.vx = 0;
            ball.vy = 0;
          }
        }
      });
    });

    return moving;
  }, []);

  // Animation loop with assignment tracking
  const animate = useCallback(() => {
    if (!gameState) return;

    // Track balls before physics update
    const beforePocketed = gameState.board.filter(b => b.pocketed).map(b => b.id);
    
    const moving = updatePhysics(gameState.board, gameState.cueBall);
    
    // Check for newly pocketed balls and handle assignments immediately
    const afterPocketed = gameState.board.filter(b => b.pocketed).map(b => b.id);
    const newlyPocketed = afterPocketed.filter(id => !beforePocketed.includes(id));
    
    let updatedGameState = { ...gameState };
    
    if (newlyPocketed.length > 0) {
      // Handle player assignments for newly pocketed balls
      const updatedAssignments = { ...gameState.playerAssignments };
      const currentPlayer = gameState.turn || currentUserId;
      
      newlyPocketed.forEach(ballId => {
        const ball = gameState.board.find(b => b.id === ballId);
        if (!ball || ball.type === '8ball') return;
        
        // If current player has no assignment yet, assign them based on what they pocketed
        if (!updatedAssignments[currentPlayer]) {
          updatedAssignments[currentPlayer] = ball.type === 'solid' ? 'solids' : 'stripes';
          
          // Assign opponent to the opposite type
          const opponent = gameState.players.find(p => p !== currentPlayer);
          if (opponent && !updatedAssignments[opponent]) {
            updatedAssignments[opponent] = ball.type === 'solid' ? 'stripes' : 'solids';
          }
        }
      });
      
      // Update game state with new assignments
      updatedGameState = { 
        ...updatedGameState, 
        playerAssignments: updatedAssignments 
      };
    }
    
    if (moving) {
      onGameUpdate(updatedGameState);
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onGameUpdate(updatedGameState);
    }
  }, [gameState, updatePhysics, onGameUpdate, currentUserId]);

  // Start animation when balls are moving
  useEffect(() => {
    if (gameState && (gameState.board.some(b => Math.abs(b.vx) > MIN_VELOCITY || Math.abs(b.vy) > MIN_VELOCITY) ||
        Math.abs(gameState.cueBall.vx) > MIN_VELOCITY || Math.abs(gameState.cueBall.vy) > MIN_VELOCITY)) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, gameState]);

  // Drawing function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    
    // Draw table felt
    const gradient = ctx.createLinearGradient(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    gradient.addColorStop(0, "#1a5d1a");
    gradient.addColorStop(1, "#0d400d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    
    // Draw table border
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, TABLE_WIDTH - 40, TABLE_HEIGHT - 40);
    
    // Draw break line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(TABLE_WIDTH * 0.25, 40);
    ctx.lineTo(TABLE_WIDTH * 0.25, TABLE_HEIGHT - 40);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw pockets
    const pockets = [
      { x: 40, y: 40 },
      { x: TABLE_WIDTH - 40, y: 40 },
      { x: 40, y: TABLE_HEIGHT - 40 },
      { x: TABLE_WIDTH - 40, y: TABLE_HEIGHT - 40 },
      { x: TABLE_WIDTH / 2, y: 40 },
      { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 40 },
    ];
    
    pockets.forEach(pocket => {
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "#000";
      ctx.fill();
      
      // Pocket rim
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, 22, 0, 2 * Math.PI);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    if (!gameState) return;

    // Draw cue ball
    if (!gameState.cueBall.pocketed) {
      const ball = gameState.cueBall;
      
      // Shadow
      ctx.beginPath();
      ctx.arc(ball.x + 2, ball.y + 2, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fill();
      
      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw balls
    gameState.board.forEach(ball => {
      if (ball.pocketed) return;
      
      // Shadow
      ctx.beginPath();
      ctx.arc(ball.x + 2, ball.y + 2, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fill();
      
      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = ball.color;
      ctx.fill();
      
      // Stripe pattern for stripe balls
      if (ball.type === 'stripe') {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      
      // Ball border
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Ball number
      ctx.fillStyle = ball.type === 'stripe' || ball.id === 8 ? "#000" : "#fff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ball.id.toString(), ball.x, ball.y);
    });

    // Draw aiming guide and cue stick when aiming
    if (isAiming && !gameState.cueBall.pocketed && gameState.turn === currentUserId && gameState.turn) {
      const cueBall = gameState.cueBall;
      
      // Calculate pull vector (from cue ball to current position)
      const pullX = currentPos.x - cueBall.x;
      const pullY = currentPos.y - cueBall.y;
      const pull = Math.sqrt(pullX * pullX + pullY * pullY);
      
      // Pull angle (direction player is pulling)
      const pullAngle = Math.atan2(pullY, pullX);
      
      // Shot angle (opposite of pull - where ball will go)
      const shotAngle = pullAngle + Math.PI;
      
      // Power calculation
      const maxPull = 150;
      const clampedPull = Math.min(pull, maxPull);
      const power = (clampedPull / maxPull) * 100;
      
      // Draw aiming guide line (shows where ball will go - opposite of pull)
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(
        cueBall.x + Math.cos(shotAngle) * 300,
        cueBall.y + Math.sin(shotAngle) * 300
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + power / 200})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw cue stick pulled back (in pull direction, behind the ball)
      const stickBaseDistance = 30 + clampedPull;
      const stickLength = 120;
      
      const stickStartX = cueBall.x + Math.cos(pullAngle) * stickBaseDistance;
      const stickStartY = cueBall.y + Math.sin(pullAngle) * stickBaseDistance;
      const stickEndX = stickStartX + Math.cos(pullAngle) * stickLength;
      const stickEndY = stickStartY + Math.sin(pullAngle) * stickLength;
      
      // Stick shaft (wood brown)
      const gradient = ctx.createLinearGradient(stickStartX, stickStartY, stickEndX, stickEndY);
      gradient.addColorStop(0, "#8B4513");
      gradient.addColorStop(1, "#D2691E");
      
      ctx.beginPath();
      ctx.moveTo(stickStartX, stickStartY);
      ctx.lineTo(stickEndX, stickEndY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.stroke();
      
      // Stick tip (black)
      ctx.beginPath();
      ctx.arc(stickStartX, stickStartY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Power indicator
      if (power > 0) {
        const powerBarWidth = 120;
        const powerBarHeight = 15;
        const powerBarX = TABLE_WIDTH / 2 - powerBarWidth / 2;
        const powerBarY = 30;
        
        // Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.roundRect(powerBarX - 5, powerBarY - 5, powerBarWidth + 10, powerBarHeight + 10, 5);
        ctx.fill();
        
        // Power bar background
        ctx.fillStyle = "#333";
        ctx.roundRect(powerBarX, powerBarY, powerBarWidth, powerBarHeight, 3);
        ctx.fill();
        
        // Power level
        const powerWidth = (power / 100) * powerBarWidth;
        const powerColor = power < 30 ? "#4CAF50" : power < 70 ? "#FFC107" : "#F44336";
        ctx.fillStyle = powerColor;
        ctx.roundRect(powerBarX, powerBarY, powerWidth, powerBarHeight, 3);
        ctx.fill();
        
        // Power text
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${Math.round(power)}%`, TABLE_WIDTH / 2, powerBarY + powerBarHeight / 2);
      }
    }
  }, [gameState, isAiming, aimStart, currentPos, currentUserId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Get position from mouse or touch event
  const getEventPosition = (event: React.MouseEvent | React.TouchEvent): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    } else if ('clientX' in event) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
    return null;
  };

  // Start aiming - mouse down or touch start
  const handlePointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    if (!gameState || gameState.turn !== currentUserId || gameState.cueBall.pocketed || !gameState.turn) return;
    
    const pos = getEventPosition(event);
    if (!pos) return;
    
    // Start aiming from this position
    setAimStart(pos);
    setCurrentPos(pos);
    setIsAiming(true);
    setPullDistance(0);
  };

  // Continue aiming - mouse move or touch move
  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isAiming || !gameState) return;
    
    const pos = getEventPosition(event);
    if (!pos) return;
    
    // Update current position
    setCurrentPos(pos);
    
    // Calculate pull distance from cue ball to current position
    const cueBall = gameState.cueBall;
    const dx = pos.x - cueBall.x;
    const dy = pos.y - cueBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    setPullDistance(distance);
  };

  // Release shot - mouse up or touch end
  const handlePointerUp = (event: React.MouseEvent | React.TouchEvent) => {
    if (!gameState || !isAiming) return;
    
    const cueBall = gameState.cueBall;
    
    // Calculate shot direction based on pull vector
    // Pull vector: from cue ball to current position (where they're pulling from)
    const pullX = currentPos.x - cueBall.x;
    const pullY = currentPos.y - cueBall.y;
    
    // Shot direction: opposite of pull (toward target, away from pull)
    const shotAngle = Math.atan2(-pullY, -pullX);
    
    // Power based on pull distance (max 150 pixels = 100% power)
    const maxPull = 150;
    const clampedPull = Math.min(pullDistance, maxPull);
    const power = (clampedPull / maxPull) * 100;
    
    // Only shoot if there's enough power
    if (power > 5) {
      // Convert power to force (adjusted for good gameplay feel)
      const force = (power / 100) * 50; // Increase this multiplier for stronger hits
      
      // Apply force in shot direction (opposite of pull)
      const newGameState = {
        ...gameState,
        cueBall: {
          ...cueBall,
          vx: Math.cos(shotAngle) * force,
          vy: Math.sin(shotAngle) * force
        }
      };
      
      onGameUpdate(newGameState);
    }
    
    // Reset aiming state
    setIsAiming(false);
    setPullDistance(0);
  };

  const getCurrentPlayerName = () => {
    if (!gameState?.turn) return "Unknown";
    return gameState.turn === currentUserId ? "You" : (playerNames[gameState.turn] || "Opponent");
  };

  const getPlayerAssignment = (playerId: string) => {
    return gameState?.playerAssignments[playerId] || null;
  };

  const pocketedSolids = gameState?.board.filter(b => b.pocketed && b.type === 'solid').length || 0;
  const pocketedStripes = gameState?.board.filter(b => b.pocketed && b.type === 'stripe').length || 0;
  const remaining8Ball = gameState?.board.find(b => b.id === 8 && !b.pocketed);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-gamepad text-white"></i>
          </div>
          <div>
            <h2 className="font-space font-bold text-xl">8-Ball Pool</h2>
            <p className="text-gray-400 text-sm">
              {gameState ? 'Realistic physics gameplay' : 'No active game'}
            </p>
          </div>
        </div>
        {!gameState && (
          <Button
            onClick={onStartPractice}
            className="glass-morphism px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-all"
            data-testid="button-start-practice"
          >
            <i className="fas fa-plus mr-2"></i>Start Practice
          </Button>
        )}
      </div>

      <GlassmorphicCard>
        {gameState ? (
          <>
            {/* Player Display */}
            <div className="flex items-center justify-between mb-4 p-3 bg-black bg-opacity-20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="font-bold text-white text-sm">
                      {playerNames[currentUserId]?.split(' ').map(n => n[0]).join('') || 'YOU'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">You</span>
                    <div className="text-xs text-gray-400">
                      {getPlayerAssignment(currentUserId) ? getPlayerAssignment(currentUserId) : 'Not assigned'}
                    </div>
                  </div>
                </div>
                
                {gameState.players.length > 1 && (
                  <>
                    <span className="text-gray-400">vs</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-sm">
                          {playerNames[gameState.players.find(p => p !== currentUserId) || '']?.split(' ').map(n => n[0]).join('') || 'OP'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-white">
                          {playerNames[gameState.players.find(p => p !== currentUserId) || ''] || 'Opponent'}
                        </span>
                        <div className="text-xs text-gray-400">
                          {getPlayerAssignment(gameState.players.find(p => p !== currentUserId) || '') || 'Not assigned'}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
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

            {/* Pool Table */}
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 mb-4 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                className="w-full h-auto cursor-crosshair border-4 border-amber-700 rounded-lg touch-none"
                onMouseDown={handlePointerDown}
                onMouseUp={handlePointerUp}
                onMouseMove={handlePointerMove}
                onMouseLeave={() => setIsAiming(false)}
                onTouchStart={handlePointerDown}
                onTouchEnd={handlePointerUp}
                onTouchMove={handlePointerMove}
                data-testid="realistic-pool-table"
              />
            </div>

            {/* Ball Tracker */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black bg-opacity-20 rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2 text-yellow-400">Solids (1-7)</h4>
                <div className="flex flex-wrap gap-1">
                  {gameState.board.filter(b => b.type === 'solid').map(ball => (
                    <div
                      key={ball.id}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        ball.pocketed ? 'opacity-30' : ''
                      }`}
                      style={{ backgroundColor: ball.color }}
                    >
                      {ball.id}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">{pocketedSolids}/7 pocketed</div>
              </div>
              
              <div className="bg-black bg-opacity-20 rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2 text-blue-400">Stripes (9-15)</h4>
                <div className="flex flex-wrap gap-1">
                  {gameState.board.filter(b => b.type === 'stripe').map(ball => (
                    <div
                      key={ball.id}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${
                        ball.pocketed ? 'opacity-30' : ''
                      }`}
                      style={{ backgroundColor: ball.color }}
                    >
                      {ball.id}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">{pocketedStripes}/7 pocketed</div>
              </div>
            </div>

            {/* 8-Ball Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">8</div>
                <span className={remaining8Ball ? "text-white" : "text-red-400"}>
                  {remaining8Ball ? "8-Ball in play" : "8-Ball pocketed!"}
                </span>
              </div>
              
              <div className="text-gray-400 text-center">
                {gameState.turn === currentUserId && gameState.state === 'in-progress' && !gameState.cueBall.pocketed
                  ? 'Drag stick BACKWARD to aim & charge power, release to shoot'
                  : gameState.cueBall.pocketed 
                  ? 'Scratch! Place cue ball behind break line'
                  : 'Wait for your turn'
                }
              </div>
              
              <span data-testid="game-id" className="text-gray-500">
                #{gameState.id.slice(-6)}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-gamepad text-gray-400 text-2xl"></i>
            </div>
            <h3 className="font-semibold text-lg mb-2">No Active Game</h3>
            <p className="text-gray-400 mb-4">Start a practice game with realistic pool physics</p>
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