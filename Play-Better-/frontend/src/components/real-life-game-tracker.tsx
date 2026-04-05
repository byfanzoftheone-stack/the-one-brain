import { useState, useEffect, useRef } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import { buildUrl } from "@/lib/queryClient";

interface RealLifeGameTrackerProps {
  currentUser: Player;
  nearbyPlayers: Player[];
  onUpdateStats: (playerId: string, result: 'win' | 'loss', gameType: 'realLife') => void;
  userUid: string;
}

interface RealLifeGame {
  id: string;
  dbGameId?: number;
  player1: string;
  player2: string;
  location: string;
  startTime: Date;
  currentTurn: string;
  status: 'waiting' | 'in-progress' | 'finished';
  winner?: string;
}

export function RealLifeGameTracker({ currentUser, nearbyPlayers, onUpdateStats, userUid }: RealLifeGameTrackerProps) {
  const { toast } = useToast();
  const [activeGame, setActiveGame] = useState<RealLifeGame | null>(null);
  const [gameLocation, setGameLocation] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [turnTimer, setTurnTimer] = useState(0);
  const [isBuzzing, setIsBuzzing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const buzzerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }, []);

  // Turn timer for buzzer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeGame && activeGame.status === 'in-progress' && activeGame.currentTurn === currentUser.id) {
      interval = setInterval(() => {
        setTurnTimer(prev => {
          const newTime = prev + 1;
          // Start buzzing after 2 minutes (120 seconds)
          if (newTime >= 120 && !isBuzzing) {
            startBuzzer();
          }
          return newTime;
        });
      }, 1000);
    } else {
      setTurnTimer(0);
      stopBuzzer();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeGame, isBuzzing, currentUser.id]);

  // Create annoying buzzer sound
  const createBuzzerSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Annoying buzzer frequency
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const startBuzzer = () => {
    setIsBuzzing(true);
    buzzerIntervalRef.current = setInterval(() => {
      createBuzzerSound();
    }, 2000); // Buzz every 2 seconds
    
    toast({
      title: "⏰ Your Turn!",
      description: "Please return to the table to take your shot",
      variant: "destructive",
    });
  };

  const stopBuzzer = () => {
    setIsBuzzing(false);
    if (buzzerIntervalRef.current) {
      clearInterval(buzzerIntervalRef.current);
      buzzerIntervalRef.current = null;
    }
  };

  const createRealLifeGame = () => {
    if (!gameLocation.trim() || !selectedOpponent) {
      toast({
        title: "Missing Information",
        description: "Please select an opponent and enter a location",
        variant: "destructive",
      });
      return;
    }

    const newGame: RealLifeGame = {
      id: `real-life-${Date.now()}`,
      player1: currentUser.id,
      player2: selectedOpponent,
      location: gameLocation.trim(),
      startTime: new Date(),
      currentTurn: currentUser.id,
      status: 'in-progress'
    };

    setActiveGame(newGame);
    setIsCreatingGame(false);
    setGameLocation("");
    setSelectedOpponent("");

    toast({
      title: "Real-Life Game Started",
      description: `Game started at ${gameLocation}. Good luck!`,
    });
  };

  const endTurn = () => {
    if (!activeGame) return;

    const nextPlayer = activeGame.currentTurn === activeGame.player1 
      ? activeGame.player2 
      : activeGame.player1;

    setActiveGame({
      ...activeGame,
      currentTurn: nextPlayer
    });

    setTurnTimer(0);
    stopBuzzer();

    toast({
      title: "Turn Switched",
      description: nextPlayer === currentUser.id ? "It's your turn now!" : "Opponent's turn",
    });
  };

  const finishGame = async (winner: string) => {
    if (!activeGame) return;

    const loser = winner === activeGame.player1 ? activeGame.player2 : activeGame.player1;
    
    // For preview mode, just update local stats
    if (userUid === 'preview-user') {
      onUpdateStats(winner, 'win', 'realLife');
      onUpdateStats(loser, 'loss', 'realLife');

      setActiveGame({
        ...activeGame,
        status: 'finished',
        winner
      });

      stopBuzzer();
      setTurnTimer(0);

      toast({
        title: "Game Finished",
        description: winner === currentUser.id ? "Congratulations, you won!" : "Better luck next time!",
      });

      setTimeout(() => {
        setActiveGame(null);
      }, 5000);
      return;
    }

    // For real mode, save to database
    try {
      // Get UIDs: current user has userUid, opponent is in nearbyPlayers
      const winnerUid = winner === currentUser.id ? userUid : nearbyPlayers.find(p => p.id === winner)?.uid;
      const loserUid = loser === currentUser.id ? userUid : nearbyPlayers.find(p => p.id === loser)?.uid;

      if (!winnerUid || !loserUid) {
        throw new Error('Could not find player UIDs');
      }

      const [winnerResponse, loserResponse] = await Promise.all([
        fetch(buildUrl(`/api/players/uid/${winnerUid}`)),
        fetch(buildUrl(`/api/players/uid/${loserUid}`))
      ]);

      if (!winnerResponse.ok || !loserResponse.ok) {
        throw new Error('Failed to fetch player data');
      }

      const winnerDbPlayer = await winnerResponse.json();
      const loserDbPlayer = await loserResponse.json();

      const gameResponse = await fetch(buildUrl('/api/games'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'realLife',
          player1Id: winnerDbPlayer.id,
          player2Id: loserDbPlayer.id,
          state: 'finished',
          location: activeGame.location,
        }),
      });

      if (!gameResponse.ok) {
        throw new Error('Failed to create game record');
      }

      const createdGame = await gameResponse.json();

      const finishResponse = await fetch(buildUrl(`/api/games/${createdGame.id}/finish`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: winnerDbPlayer.id,
          gameType: 'realLife',
        }),
      });

      if (!finishResponse.ok) {
        throw new Error('Failed to finish game');
      }

      const [updatedWinnerResponse, updatedLoserResponse] = await Promise.all([
        fetch(buildUrl(`/api/players/uid/${winnerUid}`)),
        fetch(buildUrl(`/api/players/uid/${loserUid}`))
      ]);

      if (updatedWinnerResponse.ok) {
        const updatedWinner = await updatedWinnerResponse.json();
        
        setActiveGame({
          ...activeGame,
          status: 'finished',
          winner,
          dbGameId: createdGame.id
        });

        stopBuzzer();
        setTurnTimer(0);

        toast({
          title: "Game Finished",
          description: winner === currentUser.id 
            ? `Congratulations! Your real-life record: ${updatedWinner.realLifeWins}W - ${updatedWinner.realLifeLosses}L`
            : "Better luck next time!",
        });

        setTimeout(() => {
          setActiveGame(null);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Failed to save real-life game:', error);
      
      onUpdateStats(winner, 'win', 'realLife');
      onUpdateStats(loser, 'loss', 'realLife');

      setActiveGame({
        ...activeGame,
        status: 'finished',
        winner
      });

      stopBuzzer();
      setTurnTimer(0);

      toast({
        title: "Game Finished",
        description: winner === currentUser.id 
          ? "You won! (Stats saved locally)"
          : "You lost! (Stats saved locally)",
        variant: "default",
      });

      setTimeout(() => {
        setActiveGame(null);
      }, 5000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPlayerName = () => {
    if (!activeGame) return "";
    const isCurrentUser = activeGame.currentTurn === currentUser.id;
    if (isCurrentUser) return "You";
    
    const opponent = nearbyPlayers.find(p => p.id === activeGame.currentTurn);
    return opponent?.name || "Opponent";
  };

  const getOpponentName = () => {
    if (!activeGame) return "";
    const opponentId = activeGame.player1 === currentUser.id ? activeGame.player2 : activeGame.player1;
    const opponent = nearbyPlayers.find(p => p.id === opponentId);
    return opponent?.name || "Opponent";
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <i className="fas fa-map-marker-alt text-white"></i>
        </div>
        <div>
          <h3 className="font-space font-bold text-lg">Real-Life Pool</h3>
          <p className="text-gray-400 text-sm">Track games at local venues</p>
        </div>
      </div>

      {!activeGame ? (
        <>
          {!isCreatingGame ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-location-dot text-gray-400 text-2xl"></i>
              </div>
              <h4 className="font-semibold text-lg mb-2">No Active Real-Life Game</h4>
              <p className="text-gray-400 mb-4">Start tracking a game at your local pool hall</p>
              <Button
                onClick={() => setIsCreatingGame(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                data-testid="button-start-real-life-game"
              >
                <i className="fas fa-plus mr-2"></i>Start Real-Life Game
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="block text-sm font-medium mb-2">Game Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Snake River Brewing, Corner Pocket..."
                  value={gameLocation}
                  onChange={(e) => setGameLocation(e.target.value)}
                  className="w-full"
                  data-testid="input-game-location"
                />
              </div>

              <div>
                <Label htmlFor="opponent" className="block text-sm font-medium mb-2">Select Opponent</Label>
                <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                  <SelectTrigger className="w-full" data-testid="select-opponent">
                    <SelectValue placeholder="Choose your opponent" />
                  </SelectTrigger>
                  <SelectContent>
                    {nearbyPlayers
                      .filter(p => p.id !== currentUser.id && p.status === 'available')
                      .map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          <div className="flex items-center space-x-2">
                            <span>{player.name}</span>
                            <span className="text-gray-400 text-sm">({player.skill})</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={createRealLifeGame}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-create-game"
                >
                  Create Game
                </Button>
                <Button
                  onClick={() => setIsCreatingGame(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* Game Header */}
          <div className="bg-black bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">{activeGame.location}</h4>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeGame.status === 'finished' 
                  ? 'bg-gray-500 bg-opacity-20 text-gray-400'
                  : 'bg-green-500 bg-opacity-20 text-green-400'
              }`}>
                {activeGame.status === 'finished' ? 'Finished' : 'In Progress'}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Started: {activeGame.startTime.toLocaleTimeString()}</span>
              <span>Real-Life Game #{activeGame.id.slice(-6)}</span>
            </div>
          </div>

          {/* Players */}
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <span className="font-semibold">You</span>
                <div className="text-xs text-gray-400">
                  {currentUser.realLifeWins || 0}W - {currentUser.realLifeLosses || 0}L
                </div>
              </div>
            </div>

            <span className="text-gray-400">vs</span>

            <div className="flex items-center space-x-3">
              <div>
                <span className="font-semibold">{getOpponentName()}</span>
                <div className="text-xs text-gray-400">
                  Real-life record
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {getOpponentName().split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>

          {/* Turn Indicator */}
          {activeGame.status === 'in-progress' && (
            <div className={`p-4 rounded-lg text-center ${
              activeGame.currentTurn === currentUser.id
                ? 'bg-green-500 bg-opacity-20 border border-green-500'
                : 'bg-yellow-500 bg-opacity-20 border border-yellow-500'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {isBuzzing && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <span className="font-semibold">
                  {activeGame.currentTurn === currentUser.id ? "Your Turn" : `${getCurrentPlayerName()}'s Turn`}
                </span>
              </div>
              
              <div className="text-sm text-gray-400 mb-3">
                Turn time: {formatTime(turnTimer)}
                {turnTimer >= 120 && (
                  <span className="text-red-400 ml-2">(Return to table!)</span>
                )}
              </div>

              <div className="flex space-x-2">
                {activeGame.currentTurn === currentUser.id && (
                  <>
                    <Button
                      onClick={endTurn}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      data-testid="button-end-turn"
                    >
                      End Turn
                    </Button>
                    <Button
                      onClick={() => finishGame(currentUser.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                      data-testid="button-i-won"
                    >
                      I Won!
                    </Button>
                  </>
                )}
                
                {activeGame.currentTurn !== currentUser.id && (
                  <Button
                    onClick={() => finishGame(activeGame.currentTurn)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid="button-opponent-won"
                  >
                    Opponent Won
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Game Finished */}
          {activeGame.status === 'finished' && (
            <div className="text-center p-4 bg-black bg-opacity-20 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">
                {activeGame.winner === currentUser.id ? "🎉 You Won!" : "😔 You Lost"}
              </h4>
              <p className="text-gray-400">Stats have been updated</p>
            </div>
          )}
        </div>
      )}
    </GlassmorphicCard>
  );
}