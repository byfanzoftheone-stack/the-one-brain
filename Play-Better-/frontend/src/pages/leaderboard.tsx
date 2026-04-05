import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Users, Award, ArrowLeft } from "lucide-react";
import type { PlayerWithStats } from "@shared/schema";

export default function Leaderboard() {
  const [gameType, setGameType] = useState<"online" | "realLife">("realLife");

  const { data: leaderboard, isLoading } = useQuery<PlayerWithStats[]>({
    // Key includes the full API path so the default queryFn can resolve it correctly
    queryKey: [`/api/leaderboard/${gameType}?limit=50`],
  });

  const getRankColor = (index: number) => {
    if (index === 0) return "from-yellow-500 to-yellow-600";
    if (index === 1) return "from-gray-400 to-gray-500";
    if (index === 2) return "from-orange-600 to-orange-700";
    return "from-gray-700 to-gray-800";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-red-500 to-orange-600',
      'from-yellow-500 to-red-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/">
          <button 
            className="glass-morphism px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 mb-6 flex items-center space-x-2"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-space font-black text-4xl md:text-5xl mb-2">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Top players in Idaho Falls pool community
            </p>
          </div>
          <Trophy className="w-16 h-16 text-yellow-500 animate-pulse" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-morphism p-6 border-none">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Players</p>
                <p className="text-2xl font-bold" data-testid="text-total-players">
                  {leaderboard?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-morphism p-6 border-none">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Top Win Rate</p>
                <p className="text-2xl font-bold" data-testid="text-top-winrate">
                  {leaderboard && leaderboard.length > 0
                    ? `${(gameType === "online" ? leaderboard[0].onlineWinRate : leaderboard[0].realLifeWinRate).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-morphism p-6 border-none">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Most Wins</p>
                <p className="text-2xl font-bold" data-testid="text-most-wins">
                  {leaderboard && leaderboard.length > 0
                    ? (gameType === "online" ? leaderboard[0].onlineWins : leaderboard[0].realLifeWins)
                    : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={gameType} onValueChange={(value) => setGameType(value as "online" | "realLife")} className="w-full">
          <TabsList className="glass-morphism mb-6 border-none">
            <TabsTrigger value="realLife" className="data-[state=active]:bg-red-600" data-testid="tab-reallife">
              Real-Life Games
            </TabsTrigger>
            <TabsTrigger value="online" className="data-[state=active]:bg-red-600" data-testid="tab-online">
              Online Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value={gameType}>
            <Card className="glass-morphism border-none">
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-gray-400 mt-4">Loading rankings...</p>
                  </div>
                ) : !leaderboard || leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No players ranked yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Play some games to appear on the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((player, index) => {
                      const wins = gameType === "online" ? player.onlineWins : player.realLifeWins;
                      const losses = gameType === "online" ? player.onlineLosses : player.realLifeLosses;
                      const totalGames = wins + losses;
                      const winRate = gameType === "online" ? player.onlineWinRate : player.realLifeWinRate;

                      return (
                        <div
                          key={player.id}
                          className={`glass-morphism rounded-xl p-4 hover:bg-white hover:bg-opacity-10 transition-all duration-200 ${
                            index < 3 ? "border-2 border-yellow-500/30" : ""
                          }`}
                          data-testid={`leaderboard-player-${player.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Rank Badge */}
                              <div
                                className={`w-14 h-14 bg-gradient-to-br ${getRankColor(index)} rounded-lg flex items-center justify-center flex-shrink-0`}
                              >
                                <span className="text-2xl font-bold" data-testid={`rank-${player.id}`}>
                                  {getRankIcon(index)}
                                </span>
                              </div>

                              {/* Player Avatar */}
                              <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarGradient(player.name)} rounded-full flex items-center justify-center`}>
                                <span className="font-bold text-white">{getInitials(player.name)}</span>
                              </div>

                              {/* Player Info */}
                              <div>
                                <h3 className="font-semibold text-lg" data-testid={`player-name-${player.id}`}>
                                  {player.name}
                                </h3>
                                <p className="text-sm text-gray-400" data-testid={`player-skill-${player.id}`}>
                                  {player.skill}
                                </p>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6">
                              {/* Win Rate */}
                              <div className="text-center">
                                <p className="text-sm text-gray-400">Win Rate</p>
                                <p className="text-xl font-bold text-green-400" data-testid={`winrate-${player.id}`}>
                                  {winRate.toFixed(1)}%
                                </p>
                              </div>

                              {/* Record */}
                              <div className="text-center">
                                <p className="text-sm text-gray-400">Record</p>
                                <p className="text-xl font-bold" data-testid={`record-${player.id}`}>
                                  {wins}W - {losses}L
                                </p>
                              </div>

                              {/* Total Games */}
                              <div className="text-center">
                                <p className="text-sm text-gray-400">Games</p>
                                <p className="text-xl font-bold text-blue-400" data-testid={`games-${player.id}`}>
                                  {totalGames}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
