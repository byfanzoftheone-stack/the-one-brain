import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Player } from "@/types/game";

interface StatsCardProps {
  player: Player;
}

export function StatsCard({ player }: StatsCardProps) {
  const totalGames = player.wins + player.losses;
  const winRate = totalGames > 0 ? Math.round((player.wins / totalGames) * 100) : 0;
  
  const getSkillProgress = (skill: Player['skill']) => {
    switch (skill) {
      case 'Beginner': return 25;
      case 'Intermediate': return 50;
      case 'Advanced': return 75;
      case 'Pro': return 100;
      default: return 0;
    }
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
          <i className="fas fa-chart-line text-white"></i>
        </div>
        <div>
          <h3 className="font-space font-bold text-lg">Your Stats</h3>
          <p className="text-gray-400 text-sm">Performance overview</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Games</span>
          <span className="font-bold" data-testid="total-games">{totalGames}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Wins</span>
          <span className="font-bold text-green-400" data-testid="wins">{player.wins}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Losses</span>
          <span className="font-bold text-red-400" data-testid="losses">{player.losses}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Win Rate</span>
          <span className="font-bold text-primary" data-testid="win-rate">{winRate}%</span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Skill Progress</span>
            <span className="text-primary">{player.skill}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-red-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${getSkillProgress(player.skill)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
