import { db, pool } from "./db.js";
import {
  players, games, chatMessages,
  type Player, type InsertPlayer, type Game, type InsertGame,
  type ChatMessage, type InsertChatMessage, type PlayerWithStats
} from "../shared/schema.js";
import { eq, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayerById(id: number): Promise<Player | undefined>;
  getPlayerByUid(uid: string): Promise<Player | undefined>;
  updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<Player | undefined>;
  updatePlayerLocation(uid: string, lat: number, lon: number): Promise<void>;
  updatePlayerStatus(uid: string, status: "available" | "busy" | "offline"): Promise<void>;
  getNearbyPlayers(lat: number, lon: number, radiusMiles: number): Promise<Player[]>;
  getLeaderboard(gameType: "online" | "realLife", limit: number): Promise<PlayerWithStats[]>;
  listPlayers(): Promise<Player[]>;
  createGame(game: InsertGame): Promise<Game>;
  getGameById(id: number): Promise<Game | undefined>;
  updateGame(id: number, updates: Partial<InsertGame>): Promise<Game | undefined>;
  finishGame(id: number, winnerId: number): Promise<void>;
  getPlayerGames(playerId: number, limit?: number): Promise<Game[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getGameMessages(gameId: number): Promise<ChatMessage[]>;
  updatePlayerStats(playerId: number, gameType: "online" | "realLife", won: boolean): Promise<void>;
  createPing(input: { toPlayerId: number; sound: string }): Promise<{ id: number; toPlayerId: number; sound: string; createdAt: string }>;
  listPings(toPlayerId: number): Promise<Array<{ id: number; toPlayerId: number; sound: string; createdAt: string }>>;
  createTournament(input: { type: "digital" | "live"; playerIds: number[]; venueName?: string }): Promise<any>;
  getTournament(id: number): Promise<any | undefined>;
  reportTournamentResult(input: { tournamentId: number; matchId: number; winnerPlayerId: number }): Promise<any>;
  assignTournamentTable(input: { tournamentId: number; matchId: number; tableNumber: number }): Promise<any>;
  listMerch(): Promise<any[]>;
  createMerch(input: { name: string; price: string; image_data: string }): Promise<any>;
  updateMerchPrice(id: number, price: string): Promise<any>;
  listFlyers(): Promise<any[]>;
  createFlyer(input: { image_data: string }): Promise<any>;
  deleteFlyer(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }
  async getPlayerById(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }
  async getPlayerByUid(uid: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.uid, uid));
    return player;
  }
  async updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [player] = await db.update(players).set({ ...updates, updatedAt: new Date() }).where(eq(players.id, id)).returning();
    return player;
  }
  async updatePlayerLocation(uid: string, lat: number, lon: number): Promise<void> {
    await db.update(players).set({ lat, lon, updatedAt: new Date() }).where(eq(players.uid, uid));
  }
  async updatePlayerStatus(uid: string, status: "available" | "busy" | "offline"): Promise<void> {
    await db.update(players).set({ status, updatedAt: new Date() }).where(eq(players.uid, uid));
  }
  async getNearbyPlayers(lat: number, lon: number, radiusMiles: number): Promise<Player[]> {
    return db.select().from(players).where(
      sql`(3958.8 * acos(cos(radians(${lat})) * cos(radians(${players.lat})) * cos(radians(${players.lon}) - radians(${lon})) + sin(radians(${lat})) * sin(radians(${players.lat})))) <= ${radiusMiles}`
    );
  }
  async listPlayers(): Promise<Player[]> {
    return db.select().from(players);
  }
  async getLeaderboard(gameType: "online" | "realLife", limit: number = 50): Promise<PlayerWithStats[]> {
    const winsCol = gameType === "online" ? players.onlineWins : players.realLifeWins;
    const lossCol = gameType === "online" ? players.onlineLosses : players.realLifeLosses;
    const rows = await db.select({
      id: players.id, uid: players.uid, name: players.name, skill: players.skill,
      lat: players.lat, lon: players.lon, status: players.status,
      onlineWins: players.onlineWins, onlineLosses: players.onlineLosses,
      realLifeWins: players.realLifeWins, realLifeLosses: players.realLifeLosses,
      createdAt: players.createdAt, updatedAt: players.updatedAt,
      totalGames: sql<number>`${winsCol} + ${lossCol}`,
      winRate: sql<number>`CASE WHEN (${winsCol} + ${lossCol}) > 0 THEN (${winsCol}::float / (${winsCol} + ${lossCol})) * 100 ELSE 0 END`,
    }).from(players).orderBy(desc(winsCol)).limit(limit);
    return rows.map(p => ({
      ...p,
      totalOnlineGames: p.onlineWins + p.onlineLosses,
      totalRealLifeGames: p.realLifeWins + p.realLifeLosses,
      onlineWinRate: p.onlineWins + p.onlineLosses > 0 ? (p.onlineWins / (p.onlineWins + p.onlineLosses)) * 100 : 0,
      realLifeWinRate: p.realLifeWins + p.realLifeLosses > 0 ? (p.realLifeWins / (p.realLifeWins + p.realLifeLosses)) * 100 : 0,
    }));
  }
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }
  async getGameById(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }
  async updateGame(id: number, updates: Partial<InsertGame>): Promise<Game | undefined> {
    const [game] = await db.update(games).set(updates).where(eq(games.id, id)).returning();
    return game;
  }
  async finishGame(id: number, winnerId: number): Promise<void> {
    await db.update(games).set({ state: "finished", winnerId, finishedAt: new Date() }).where(eq(games.id, id));
  }
  async getPlayerGames(playerId: number, limit: number = 20): Promise<Game[]> {
    return db.select().from(games)
      .where(sql`${games.player1Id} = ${playerId} OR ${games.player2Id} = ${playerId}`)
      .orderBy(desc(games.createdAt)).limit(limit);
  }
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }
  async getGameMessages(gameId: number): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.gameId, gameId)).orderBy(asc(chatMessages.createdAt));
  }
  async updatePlayerStats(playerId: number, gameType: "online" | "realLife", won: boolean): Promise<void> {
    if (gameType === "online") {
      if (won) await db.update(players).set({ onlineWins: sql`${players.onlineWins} + 1`, updatedAt: new Date() }).where(eq(players.id, playerId));
      else await db.update(players).set({ onlineLosses: sql`${players.onlineLosses} + 1`, updatedAt: new Date() }).where(eq(players.id, playerId));
    } else {
      if (won) await db.update(players).set({ realLifeWins: sql`${players.realLifeWins} + 1`, updatedAt: new Date() }).where(eq(players.id, playerId));
      else await db.update(players).set({ realLifeLosses: sql`${players.realLifeLosses} + 1`, updatedAt: new Date() }).where(eq(players.id, playerId));
    }
  }
  async createPing(input: { toPlayerId: number; sound: string }) {
    const q = await pool.query(
      "INSERT INTO pings (to_player_id, sound) VALUES ($1, $2) RETURNING id, to_player_id, sound, created_at",
      [input.toPlayerId, input.sound]
    );
    const r = q.rows[0];
    return { id: r.id, toPlayerId: r.to_player_id, sound: r.sound, createdAt: r.created_at.toISOString?.() ?? String(r.created_at) };
  }
  async listPings(toPlayerId: number) {
    const q = await pool.query(
      "SELECT id, to_player_id, sound, created_at FROM pings WHERE to_player_id=$1 ORDER BY id DESC LIMIT 50",
      [toPlayerId]
    );
    return q.rows.map((r: any) => ({ id: r.id, toPlayerId: r.to_player_id, sound: r.sound, createdAt: r.created_at.toISOString?.() ?? String(r.created_at) }));
  }

  private async buildTournamentResponse(tournamentId: number) {
    const tQ = await pool.query("SELECT * FROM tournaments WHERE id=$1", [tournamentId]);
    if (!tQ.rowCount) return undefined;
    const t = tQ.rows[0];
    const mQ = await pool.query(
      `SELECT tm.*, p1.id AS p1_id, p1.name AS p1_name, p2.id AS p2_id, p2.name AS p2_name
       FROM tournament_matches tm
       LEFT JOIN players p1 ON p1.id = tm.player1_id
       LEFT JOIN players p2 ON p2.id = tm.player2_id
       WHERE tm.tournament_id=$1 ORDER BY tm.round ASC, tm.match_index ASC`,
      [tournamentId]
    );
    const matches = mQ.rows.map((m: any) => ({
      id: m.id, round: m.round, slot: m.match_index,
      playerA: m.p1_id ? { id: m.p1_id, name: m.p1_name } : null,
      playerB: m.p2_id ? { id: m.p2_id, name: m.p2_name } : null,
      winnerId: m.winner_player_id, tableNumber: m.table_number, state: m.state,
    }));
    return { id: t.id, type: t.type, venueName: t.venue_name, state: t.state, bracket: t.bracket, createdAt: t.created_at, updatedAt: t.updated_at, matches };
  }

  async createTournament(input: { type: "digital" | "live"; playerIds: number[]; venueName?: string }) {
    const bracket = { rounds: 1, createdFrom: "playbetter", playerIds: input.playerIds };
    const tQ = await pool.query(
      "INSERT INTO tournaments (type, venue_name, bracket) VALUES ($1, $2, $3) RETURNING id",
      [input.type, input.venueName || null, bracket]
    );
    const tournamentId = tQ.rows[0].id;
    for (let i = 0; i < input.playerIds.length; i += 2) {
      await pool.query(
        "INSERT INTO tournament_matches (tournament_id, round, match_index, player1_id, player2_id) VALUES ($1, $2, $3, $4, $5)",
        [tournamentId, 1, i / 2, input.playerIds[i] ?? null, input.playerIds[i + 1] ?? null]
      );
    }
    return await this.buildTournamentResponse(tournamentId);
  }
  async getTournament(id: number) { return this.buildTournamentResponse(id); }
  async reportTournamentResult(input: { tournamentId: number; matchId: number; winnerPlayerId: number }) {
    await pool.query("UPDATE tournament_matches SET winner_player_id=$1, state='done' WHERE id=$2 AND tournament_id=$3", [input.winnerPlayerId, input.matchId, input.tournamentId]);
    return this.buildTournamentResponse(input.tournamentId);
  }
  async assignTournamentTable(input: { tournamentId: number; matchId: number; tableNumber: number }) {
    await pool.query("UPDATE tournament_matches SET table_number=$1 WHERE id=$2 AND tournament_id=$3", [input.tableNumber, input.matchId, input.tournamentId]);
    return this.buildTournamentResponse(input.tournamentId);
  }
  async listMerch() {
    const res = await pool.query("SELECT * FROM merchandise ORDER BY created_at DESC");
    return res.rows.map(r => ({ id: r.id, name: r.name, price: r.price, img: r.image_data }));
  }
  async createMerch(input: { name: string; price: string; image_data: string }) {
    const res = await pool.query("INSERT INTO merchandise (name, price, image_data) VALUES ($1, $2, $3) RETURNING *", [input.name, input.price, input.image_data]);
    return { id: res.rows[0].id, name: res.rows[0].name, price: res.rows[0].price, img: res.rows[0].image_data };
  }
  async updateMerchPrice(id: number, price: string) {
    const res = await pool.query("UPDATE merchandise SET price=$1 WHERE id=$2 RETURNING *", [price, id]);
    return { id: res.rows[0].id, name: res.rows[0].name, price: res.rows[0].price, img: res.rows[0].image_data };
  }
  async listFlyers() {
    const res = await pool.query("SELECT * FROM flyers ORDER BY created_at DESC");
    return res.rows.map(r => ({ id: r.id, img: r.image_data }));
  }
  async createFlyer(input: { image_data: string }) {
    const res = await pool.query("INSERT INTO flyers (image_data) VALUES ($1) RETURNING *", [input.image_data]);
    return { id: res.rows[0].id, img: res.rows[0].image_data };
  }
  async deleteFlyer(id: number) {
    await pool.query("DELETE FROM flyers WHERE id=$1", [id]);
  }
}

export const storage = new DatabaseStorage();
