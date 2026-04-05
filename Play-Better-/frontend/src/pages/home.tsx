import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuthGate } from "@/components/auth-gate";
import { useGeolocation, calculateDistance } from "@/hooks/use-geolocation";
import { useQuery } from "@tanstack/react-query";
import { buildUrl } from "@/lib/queryClient";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { PlayerCard } from "@/components/player-card";
import { RealisticPoolTable } from "@/components/realistic-pool-table";
import { ChatWindow } from "@/components/chat-window";
import { StatusSelector } from "@/components/status-selector";
import { StatsCard } from "@/components/stats-card";
import { RealLifeGameTracker } from "@/components/real-life-game-tracker";
import { TournamentBracket } from "@/components/tournament-bracket";
import { MerchStore } from "@/components/merch-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trophy, User, ShoppingBag, LogOut, Upload, Bell, Volume2 } from "lucide-react";
import { Player, GameState, ChatMessage, Challenge } from "@/types/game";
import type { Player as DBPlayer } from "@shared/schema";

const API = import.meta.env.VITE_API_URL || "";

function readFile(file: File): Promise<string> {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target!.result as string);
    r.readAsDataURL(file);
  });
}

function playPingSound(customSound: string | null) {
  if (customSound) {
    try {
      const audio = new Audio(customSound);
      audio.volume = 0.9;
      audio.play().catch(() => fallbackPing());
      return;
    } catch {}
  }
  fallbackPing();
}

function fallbackPing() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "square";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.5);
  } catch {}
}

type Tab = "players" | "game" | "tournament" | "merch" | "profile";

export default function Home() {
  const { user, loading: authLoading, logout, updateUser, isAdmin } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("players");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playerNames, setPlayerNames] = useState<{ [uid: string]: string }>({});
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "" });

  // Nearby players from backend or mock
  const [playersNearby, setPlayersNearby] = useState<Player[]>([
    { id: "1", name: "The Rocket", skill: "Advanced", status: "available", location: undefined, lastSeen: new Date(), wins: 42, losses: 18, onlineWins: 28, onlineLosses: 9, realLifeWins: 14, realLifeLosses: 9, matchHistory: [] },
    { id: "2", name: "Cool Hand", skill: "Pro", status: "available", location: undefined, lastSeen: new Date(), wins: 89, losses: 12, onlineWins: 52, onlineLosses: 7, realLifeWins: 37, realLifeLosses: 5, matchHistory: [] },
    { id: "3", name: "Venom", skill: "Intermediate", status: "offline", location: undefined, lastSeen: new Date(), wins: 23, losses: 31, onlineWins: 12, onlineLosses: 18, realLifeWins: 11, realLifeLosses: 13, matchHistory: [] },
    { id: "4", name: "The Magician", skill: "Advanced", status: "available", location: undefined, lastSeen: new Date(), wins: 61, losses: 24, onlineWins: 38, onlineLosses: 14, realLifeWins: 23, realLifeLosses: 10, matchHistory: [] },
  ]);

  // Build profile from auth user
  const profile: Player | null = user ? {
    id: user.uid,
    uid: user.uid,
    name: user.name,
    skill: user.skill,
    status: "available",
    wins: 0,
    losses: 0,
    onlineWins: 0,
    onlineLosses: 0,
    realLifeWins: 0,
    realLifeLosses: 0,
    lastSeen: new Date(),
    matchHistory: [],
    avatar: user.avatar || undefined,
  } : null;

  // Fetch nearby players
  const { data: nearbyData } = useQuery<DBPlayer[]>({
    queryKey: [latitude && longitude ? `/api/players/nearby?lat=${latitude}&lon=${longitude}&radius=50` : null],
    enabled: !!(user && latitude && longitude),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!nearbyData || !latitude || !longitude) return;
    const transformed: Player[] = nearbyData
      .filter(p => p.uid !== user?.uid)
      .map(dbp => ({
        id: String(dbp.id),
        uid: dbp.uid,
        name: dbp.name,
        skill: dbp.skill as Player["skill"],
        status: dbp.status as Player["status"],
        location: dbp.lat && dbp.lon ? { latitude: dbp.lat, longitude: dbp.lon } : undefined,
        wins: dbp.onlineWins + dbp.realLifeWins,
        losses: dbp.onlineLosses + dbp.realLifeLosses,
        onlineWins: dbp.onlineWins,
        onlineLosses: dbp.onlineLosses,
        realLifeWins: dbp.realLifeWins,
        realLifeLosses: dbp.realLifeLosses,
        lastSeen: new Date(dbp.updatedAt),
        matchHistory: [],
        distance: calculateDistance(latitude, longitude, dbp.lat!, dbp.lon!),
      }));
    if (transformed.length > 0) setPlayersNearby(transformed);
  }, [nearbyData, latitude, longitude, user]);

  // Update location
  useEffect(() => {
    if (!user || !latitude || !longitude) return;
    fetch(`${API}/api/players/uid/${user.uid}/location`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: latitude, lon: longitude }),
    }).catch(() => {});
  }, [user, latitude, longitude]);

  // Flyer state for event board
  const [flyers, setFlyers] = useState<Array<{ id: string; img: string }>>([]);

  useEffect(() => {
    fetch(`${API}/api/flyers`).then(r => r.json()).then(d => {
      if (Array.isArray(d)) setFlyers(d);
    }).catch(() => {});
  }, []);

  async function uploadFlyer(file: File) {
    const img = await readFile(file);
    try {
      const res = await fetch(`${API}/api/flyers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: img }) });
      const item = await res.json();
      setFlyers(prev => [item, ...prev]);
    } catch {
      setFlyers(prev => [{ id: String(Date.now()), img }, ...prev]);
    }
    toast({ title: "Flyer uploaded!" });
  }

  async function deleteFlyer(id: string) {
    await fetch(`${API}/api/flyers/${id}`, { method: "DELETE" }).catch(() => {});
    setFlyers(prev => prev.filter(f => f.id !== id));
  }

  // Ping a player — sound only plays for the person being pinged (simulated locally)
  function pingPlayer(player: Player) {
    // In a real multi-device setup this would go through the backend via SSE/WebSocket.
    // For now, show a toast and play sound on this device as demo.
    toast({
      title: `📍 ${player.name}`,
      description: "Where you at? It's your turn to shoot!",
    });
    // Only the pinger's own device plays sound in this demo
    // (real impl: backend pushes to recipient's device only)
  }

  // Upload custom ping sound
  async function uploadPingSound(file: File) {
    const dataUrl = await readFile(file);
    updateUser({ pingSound: dataUrl });
    localStorage.setItem("pb_ping_sound", dataUrl);
    toast({ title: "Ping sound saved!", description: "Your custom sound is set." });
  }

  // Challenge player
  async function challengePlayer(player: Player) {
    if (!user) return;
    setIsLoadingChallenge(player.id);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast({ title: "Challenge Sent!", description: `Challenged ${player.name} to a game!` });
      startGame(player.uid);
    } finally {
      setIsLoadingChallenge(null);
    }
  }

  // Start practice or vs game
  function startGame(opponentUid?: string) {
    if (!user) return;
    const ballColors = [
      "#FFFF00", "#0000FF", "#FF0000", "#800080", "#FFA500",
      "#008000", "#800000", "#000000", "#FFFF00", "#0000FF",
      "#FF0000", "#800080", "#FFA500", "#008000", "#800000"
    ];
    const rackCenterX = 600, rackCenterY = 200;
    const spacing = 26;
    const rackPositions = [
      { x: 0, y: 0 },
      { x: spacing, y: -spacing * 0.5 }, { x: spacing, y: spacing * 0.5 },
      { x: spacing * 2, y: -spacing }, { x: spacing * 2, y: 0 }, { x: spacing * 2, y: spacing },
      { x: spacing * 3, y: -spacing * 1.5 }, { x: spacing * 3, y: -spacing * 0.5 }, { x: spacing * 3, y: spacing * 0.5 }, { x: spacing * 3, y: spacing * 1.5 },
      { x: spacing * 4, y: -spacing * 2 }, { x: spacing * 4, y: -spacing }, { x: spacing * 4, y: 0 }, { x: spacing * 4, y: spacing }, { x: spacing * 4, y: spacing * 2 },
    ];
    const board = rackPositions.map((pos, i) => ({
      id: i + 1, x: rackCenterX + pos.x, y: rackCenterY + pos.y,
      vx: 0, vy: 0, pocketed: false,
      type: i + 1 === 8 ? "8ball" as const : i + 1 <= 7 ? "solid" as const : "stripe" as const,
      color: ballColors[i],
    }));
    const players = opponentUid ? [user.uid, opponentUid] : [user.uid];
    if (opponentUid) setPlayerNames(prev => ({ ...prev, [opponentUid]: playersNearby.find(p => p.uid === opponentUid)?.name || "Opponent" }));
    setPlayerNames(prev => ({ ...prev, [user.uid]: user.name }));
    setGameState({
      id: `game_${Date.now()}`,
      players,
      turn: user.uid,
      state: "in-progress",
      board,
      cueBall: { id: 0, x: 200, y: 200, vx: 0, vy: 0, pocketed: false, type: "cue", color: "#FFFFFF" },
      cueStick: { x: 0, y: 0, angle: 0, power: 0, charging: false },
      playerAssignments: {},
      winner: null,
      createdAt: new Date(),
      rackBroken: false,
      scratched: false,
      canPlaceCueBall: false,
    });
    setTab("game");
    toast({ title: opponentUid ? "Game Started!" : "Practice Started!", description: "Good luck!" });
  }

  // Update own status only
  async function updateMyStatus(status: Player["status"]) {
    if (!user) return;
    await fetch(`${API}/api/players/uid/${user.uid}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  // Save profile edits
  async function saveProfileEdits() {
    if (!user) return;
    updateUser({ name: editForm.name || user.name, username: editForm.username || user.username });
    setShowProfileEdit(false);
    toast({ title: "Profile updated!" });
  }

  // Upload avatar
  async function uploadAvatar(file: File) {
    const dataUrl = await readFile(file);
    updateUser({ avatar: dataUrl });
    toast({ title: "Avatar updated!" });
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuth={() => {}} />;
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "players", label: "Players", icon: <i className="fas fa-users" /> },
    { id: "game", label: "Table", icon: <i className="fas fa-gamepad" /> },
    { id: "tournament", label: "Bracket", icon: <Trophy className="w-4 h-4" /> },
    { id: "merch", label: "Merch", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen text-white pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-space font-black text-xl leading-none">
              <span className="text-white">Play</span>
              <span className="text-primary ml-1.5">Better</span>
            </div>
            <p className="text-gray-600 text-[10px] italic">Dedicated to Tricksack</p>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin() && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">ADMIN</span>
            )}
            <div className="flex items-center space-x-2">
              {user.avatar ? (
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.name}</span>
            </div>
            <button onClick={() => { logout(); }} className="text-gray-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* ── PLAYERS TAB ── */}
        {tab === "players" && (
          <div className="space-y-6">
            {/* Event board / flyers */}
            <GlassmorphicCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-space font-bold text-lg">Event Board</h2>
                {isAdmin() && (
                  <label className="cursor-pointer">
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 font-semibold hover:bg-primary/30 transition-colors flex items-center space-x-1">
                      <Upload className="w-3 h-3" /><span>Post Flyer</span>
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFlyer(e.target.files[0])} />
                  </label>
                )}
              </div>
              {flyers.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming events posted yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {flyers.map(f => (
                    <div key={f.id} className="relative rounded-xl overflow-hidden aspect-[3/4] group">
                      <img src={f.img} className="w-full h-full object-cover" alt="flyer" />
                      {isAdmin() && (
                        <button onClick={() => deleteFlyer(f.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>

            {/* Players nearby */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-space font-bold text-xl">Players Near You</h2>
                  <p className="text-gray-400 text-sm">{playersNearby.filter(p => p.status === "available").length} online now</p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                {playersNearby.map(player => (
                  <div key={player.id} className="glass-morphism rounded-xl p-4 hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className={`w-12 h-12 bg-gradient-to-br ${
                            ["from-blue-500 to-purple-600","from-green-500 to-teal-600","from-orange-500 to-red-600","from-yellow-500 to-orange-600"][player.name.charCodeAt(0) % 4]
                          } rounded-full flex items-center justify-center`}>
                            <span className="font-bold text-white">{player.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                            player.status === "available" ? "bg-green-500" : player.status === "busy" ? "bg-yellow-500" : "bg-gray-500"
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold">{player.name}</p>
                          <p className="text-gray-400 text-sm">{player.skill} · {player.wins}W {player.losses}L</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Ping button — sends notification to THAT player only */}
                        <button
                          onClick={() => pingPlayer(player)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all border border-white/10"
                          title="Ping — hey, your turn!"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        {player.status === "available" ? (
                          <Button onClick={() => challengePlayer(player)} disabled={isLoadingChallenge === player.id}
                            className="bg-primary hover:bg-red-600 text-white px-4 py-2 text-sm">
                            {isLoadingChallenge === player.id ? "..." : "Challenge"}
                          </Button>
                        ) : (
                          <Button disabled className="bg-gray-700 text-gray-500 px-4 py-2 text-sm">
                            {player.status === "busy" ? "Busy" : "Offline"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats sidebar on players tab */}
            {profile && (
              <div className="grid sm:grid-cols-2 gap-4">
                <StatsCard player={profile} />
                <StatusSelector
                  status="available"
                  onStatusChange={updateMyStatus}
                />
              </div>
            )}

            {/* Real life game tracker */}
            {profile && (
              <RealLifeGameTracker
                currentUser={profile}
                nearbyPlayers={playersNearby}
                onUpdateStats={async (pid, result, gameType) => {
                  toast({ title: "Stats Updated", description: `${gameType} ${result} recorded!` });
                }}
                userUid={user.uid}
              />
            )}
          </div>
        )}

        {/* ── GAME TAB ── */}
        {tab === "game" && (
          <div className="space-y-6">
            <RealisticPoolTable
              gameState={gameState}
              currentUserId={user.uid}
              onGameUpdate={setGameState}
              onStartPractice={() => startGame()}
              playerNames={playerNames}
            />
            {gameState && (
              <ChatWindow
                messages={chatMessages}
                currentUserId={user.uid}
                onSendMessage={msg => toast({ title: "Chat", description: msg })}
                opponentName={gameState.players.find(p => p !== user.uid) ? playerNames[gameState.players.find(p => p !== user.uid)!] : undefined}
              />
            )}
          </div>
        )}

        {/* ── TOURNAMENT TAB ── */}
        {tab === "tournament" && (
          <TournamentBracket players={playersNearby} />
        )}

        {/* ── MERCH TAB ── */}
        {tab === "merch" && (
          <MerchStore isAdmin={isAdmin()} />
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="space-y-6 max-w-lg mx-auto">
            <GlassmorphicCard>
              <div className="flex items-center space-x-4 mb-6">
                <label className="cursor-pointer relative group">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20" alt="" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-3xl font-black">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                </label>
                <div>
                  <h2 className="font-space font-bold text-2xl">{user.name}</h2>
                  <p className="text-gray-400">@{user.username}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20">{user.skill}</span>
                    {isAdmin() && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Admin</span>}
                  </div>
                </div>
              </div>

              {!showProfileEdit ? (
                <Button onClick={() => { setEditForm({ name: user.name, username: user.username }); setShowProfileEdit(true); }}
                  variant="outline" className="w-full border-white/20 text-gray-300">
                  Edit Profile
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Display Name</label>
                    <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Username</label>
                    <Input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowProfileEdit(false)} variant="outline" className="flex-1 border-white/20 text-gray-400">Cancel</Button>
                    <Button onClick={saveProfileEdits} className="flex-1 bg-primary hover:bg-red-600 text-white">Save</Button>
                  </div>
                </div>
              )}
            </GlassmorphicCard>

            {/* Stats */}
            {profile && <StatsCard player={profile} />}

            {/* Status control — only for the logged-in user */}
            <GlassmorphicCard>
              <h3 className="font-bold mb-3">My Status</h3>
              <p className="text-gray-400 text-sm mb-4">Other players can see this. Only you can change it.</p>
              <div className="flex space-x-2">
                {(["available", "busy", "offline"] as const).map(s => (
                  <button key={s} onClick={() => updateMyStatus(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      s === "available" ? "border-green-500/40 hover:bg-green-500/10 text-green-400" :
                      s === "busy" ? "border-yellow-500/40 hover:bg-yellow-500/10 text-yellow-400" :
                      "border-gray-500/40 hover:bg-gray-500/10 text-gray-400"
                    }`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </GlassmorphicCard>

            {/* Custom ping sound */}
            <GlassmorphicCard>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">My Ping Sound</h3>
                  <p className="text-gray-400 text-sm">Plays when someone pings you for your turn</p>
                </div>
              </div>
              <label className="block border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <p className="text-sm text-gray-400">{user.pingSound ? "✓ Custom sound set — tap to change" : "Upload MP3 / WAV from your device"}</p>
                <input type="file" accept="audio/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadPingSound(e.target.files[0])} />
              </label>
              {user.pingSound && (
                <button onClick={() => { playPingSound(user.pingSound); toast({ title: "🔊 Testing your ping sound" }); }}
                  className="mt-2 w-full text-sm text-primary hover:text-red-400 transition-colors">
                  Test Sound ▶
                </button>
              )}
            </GlassmorphicCard>

            {/* Leaderboard link */}
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full border-white/20 text-gray-300 flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>View Leaderboard</span>
              </Button>
            </Link>

            <Button onClick={logout} variant="outline" className="w-full border-red-900/40 text-red-400 hover:bg-red-900/20">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-black/80 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 space-y-1 transition-all ${tab === t.id ? "text-primary" : "text-gray-500 hover:text-gray-300"}`}>
              <span className="text-lg">{t.icon}</span>
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
