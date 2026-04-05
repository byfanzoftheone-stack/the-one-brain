export interface Player {
  id: string;
  uid?: string;
  name: string;
  skill: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  location?: { latitude: number; longitude: number };
  lat?: number;
  lon?: number;
  status: 'available' | 'busy' | 'offline';
  wins: number;
  losses: number;
  onlineWins: number;
  onlineLosses: number;
  realLifeWins: number;
  realLifeLosses: number;
  matchHistory: MatchRecord[];
  lastSeen: Date;
  distance?: number;
}

export interface MatchRecord {
  opponent: string;
  result: 'win' | 'loss';
  timestamp: Date;
}

export interface Ball {
  id: number;
  pocketed: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'cue' | 'solid' | 'stripe' | '8ball';
  color: string;
}

export interface CueStick {
  x: number;
  y: number;
  angle: number;
  power: number;
  charging: boolean;
}

export interface GameState {
  id: string;
  players: string[];
  turn: string | null;
  state: 'waiting' | 'in-progress' | 'finished';
  board: Ball[];
  cueBall: Ball;
  cueStick: CueStick;
  playerAssignments: { [playerId: string]: 'solids' | 'stripes' | null };
  winner: string | null;
  createdAt: Date;
  rackBroken: boolean;
  scratched: boolean;
  canPlaceCueBall: boolean;
}

export interface ChatMessage {
  uid: string;
  message: string;
  timestamp: Date;
  playerName?: string;
}

export interface Challenge {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
  fromPlayer?: Player;
}
