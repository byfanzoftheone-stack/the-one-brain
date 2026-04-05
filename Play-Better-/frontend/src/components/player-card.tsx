import { Player } from "@/types/game";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  player: Player;
  onChallenge: (player: Player) => void;
  isLoading?: boolean;
}

export function PlayerCard({ player, onChallenge, isLoading }: PlayerCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: Player['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: Player['status']) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'offline': return 'text-gray-400';
    }
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
    <div className="glass-morphism rounded-xl p-4 hover:bg-white hover:bg-opacity-20 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarGradient(player.name)} rounded-full flex items-center justify-center`}>
              <span className="font-bold text-white">{getInitials(player.name)}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(player.status)} rounded-full border-2 border-gray-900`}></div>
          </div>
          <div>
            <h3 className="font-semibold" data-testid={`player-name-${player.uid}`}>{player.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span data-testid={`player-skill-${player.uid}`}>{player.skill}</span>
              <span>•</span>
              <span data-testid={`player-distance-${player.uid}`}>
                {player.distance ? `${player.distance.toFixed(1)} miles away` : 'Distance unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <i className="fas fa-trophy text-yellow-500 text-xs"></i>
              <span className="text-xs text-gray-400" data-testid={`player-record-${player.uid}`}>
                {player.wins} wins • {player.losses} losses
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 ${getStatusColor(player.status)} bg-opacity-20 ${getStatusTextColor(player.status)} rounded-full text-xs font-medium`}>
            {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
          </span>
          {player.status === 'available' ? (
            <Button
              onClick={() => onChallenge(player)}
              disabled={isLoading}
              className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform group-hover:scale-105"
              data-testid={`button-challenge-${player.uid}`}
            >
              {isLoading ? 'Sending...' : 'Challenge'}
            </Button>
          ) : (
            <Button
              disabled
              className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
              data-testid={`button-busy-${player.uid}`}
            >
              {player.status === 'busy' ? 'Busy' : 'Offline'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
