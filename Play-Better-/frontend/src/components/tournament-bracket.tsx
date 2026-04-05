import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Player } from "@/types/game";

interface Match {
  id: string;
  round: number;
  slot: number;
  playerA: Player | null;
  playerB: Player | null;
  winnerId: string | null;
}

function generateBracket(players: Player[]): Match[] {
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(players.length, 2))));
  const seeded = [...players];
  while (seeded.length < size) seeded.push(null as any);
  const matches: Match[] = [];
  let id = 1;
  const rounds = Math.log2(size);
  for (let r = 1; r <= rounds; r++) {
    const count = size / Math.pow(2, r);
    for (let i = 0; i < count; i++) {
      matches.push({ id: String(id++), round: r, slot: i, playerA: null, playerB: null, winnerId: null });
    }
  }
  const r1 = matches.filter(m => m.round === 1);
  for (let i = 0; i < r1.length; i++) {
    r1[i].playerA = seeded[i * 2] || null;
    r1[i].playerB = seeded[i * 2 + 1] || null;
    if (!r1[i].playerB && r1[i].playerA) r1[i].winnerId = r1[i].playerA!.id;
  }
  return matches;
}

interface TournamentBracketProps {
  players: Player[];
}

export function TournamentBracket({ players }: TournamentBracketProps) {
  const [tourneyName, setTourneyName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [started, setStarted] = useState(false);

  const selectedPlayers = players.filter(p => selected.includes(p.id));

  function togglePlayer(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function start() {
    if (selectedPlayers.length < 2) return;
    setMatches(generateBracket(selectedPlayers));
    setStarted(true);
  }

  function advance(matchId: string, winnerId: string, winnerName: string, round: number) {
    setMatches(prev => {
      const updated = prev.map(m => m.id === matchId ? { ...m, winnerId } : m);
      const nextRound = round + 1;
      const thisRoundMatches = updated.filter(m => m.round === round);
      const thisIdx = thisRoundMatches.findIndex(m => m.id === matchId);
      const nextSlot = Math.floor(thisIdx / 2);
      const nextMatch = updated.find(m => m.round === nextRound && m.slot === nextSlot);
      if (nextMatch) {
        const isA = thisIdx % 2 === 0;
        const p = selectedPlayers.find(pl => pl.id === winnerId) || { id: winnerId, name: winnerName } as any;
        return updated.map(m => m.id === nextMatch.id ? { ...m, [isA ? "playerA" : "playerB"]: p } : m);
      }
      return updated;
    });
  }

  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 0;
  const finalMatch = matches.find(m => m.round === maxRound);
  const champion = finalMatch?.winnerId ? selectedPlayers.find(p => p.id === finalMatch.winnerId) : null;

  if (!started) {
    return (
      <GlassmorphicCard>
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-space font-bold text-lg">Create Tournament</h3>
            <p className="text-gray-400 text-sm">Select players and generate bracket</p>
          </div>
        </div>

        <div className="mb-4">
          <input value={tourneyName} onChange={e => setTourneyName(e.target.value)}
            placeholder="Tournament name (e.g. Friday Night 9-Ball)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary" />
        </div>

        <p className="text-gray-400 text-sm mb-3">Select players ({selected.length} selected, min 2):</p>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {players.length === 0 && <p className="text-gray-500 text-sm">No players available</p>}
          {players.map(p => (
            <div key={p.id} onClick={() => togglePlayer(p.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selected.includes(p.id) ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected.includes(p.id) ? "border-primary bg-primary" : "border-gray-600"}`}>
                  {selected.includes(p.id) && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="font-medium text-sm">{p.name}</span>
              </div>
              <span className="text-gray-500 text-xs">{p.skill} • {p.wins}W {p.losses}L</span>
            </div>
          ))}
        </div>

        <Button onClick={start} disabled={selected.length < 2} className="w-full bg-primary hover:bg-red-600 text-white">
          Generate Bracket →
        </Button>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-space font-bold text-lg">{tourneyName || "Tournament"}</h3>
          <p className="text-gray-400 text-sm">{selectedPlayers.length} players · tap a name to advance</p>
        </div>
        <Button onClick={() => { setStarted(false); setMatches([]); setSelected([]); }}
          variant="outline" size="sm" className="border-white/20 text-gray-400">
          Reset
        </Button>
      </div>

      {champion && (
        <div className="mb-5 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
          <p className="text-yellow-400 font-bold text-lg font-space">CHAMPION</p>
          <p className="text-white font-semibold">{champion.name}</p>
        </div>
      )}

      <div className="space-y-5 overflow-x-auto">
        {rounds.map(r => (
          <div key={r}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {r === maxRound ? "Final" : r === maxRound - 1 ? "Semi-Finals" : `Round ${r}`}
            </p>
            <div className="space-y-2">
              {matches.filter(m => m.round === r).map(m => (
                <div key={m.id} className="rounded-lg overflow-hidden border border-white/10">
                  {[{ p: m.playerA, side: "A" }, { p: m.playerB, side: "B" }].map(({ p, side }, idx) => (
                    <div key={side}>
                      <div
                        onClick={() => p && !m.winnerId && advance(m.id, p.id, p.name, r)}
                        className={`flex items-center justify-between px-4 py-2.5 transition-all ${p && !m.winnerId ? "cursor-pointer hover:bg-white/5" : ""} ${m.winnerId && p && m.winnerId === p.id ? "bg-primary/20" : ""} ${m.winnerId && p && m.winnerId !== p.id ? "opacity-40" : ""}`}
                      >
                        <span className="font-medium text-sm">{p ? p.name : <span className="text-gray-600 italic">TBD</span>}</span>
                        {m.winnerId === p?.id && <span className="text-primary text-xs font-bold">▶ WIN</span>}
                      </div>
                      {idx === 0 && <div className="h-px bg-white/10" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassmorphicCard>
  );
}
