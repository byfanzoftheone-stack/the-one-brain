import type { Express } from "express";
import { storage } from "./storage.js";
import { insertPlayerSchema, insertGameSchema, insertChatMessageSchema } from "../shared/schema.js";

export function registerRoutes(app: Express): void {
  // Players
  app.get("/api/players", async (_req, res) => {
    try { res.json(await storage.listPlayers()); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/players", async (req, res) => {
    try {
      const body = req.body ?? {};
      const normalized = (typeof body?.name === "string" && body.name.trim()) ? {
        uid: body.uid || `p_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`,
        name: body.name.trim(), skill: body.skill || "Beginner", status: body.status || "offline",
        lat: typeof body.lat === "number" ? body.lat : null,
        lon: typeof body.lon === "number" ? body.lon : null,
      } : body;
      const player = await storage.createPlayer(insertPlayerSchema.parse(normalized));
      res.json(player);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/players/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const radius = parseFloat(req.query.radius as string) || 25;
      if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: "Invalid coordinates" });
      res.json(await storage.getNearbyPlayers(lat, lon, radius));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/players/uid/:uid", async (req, res) => {
    try {
      const player = await storage.getPlayerByUid(req.params.uid);
      if (!player) return res.status(404).json({ error: "Player not found" });
      res.json(player);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayerById(parseInt(req.params.id));
      if (!player) return res.status(404).json({ error: "Player not found" });
      res.json(player);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.patch("/api/players/uid/:uid/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["available", "busy", "offline"].includes(status)) return res.status(400).json({ error: "Invalid status" });
      await storage.updatePlayerStatus(req.params.uid, status);
      res.json({ success: true });
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.patch("/api/players/uid/:uid/location", async (req, res) => {
    try {
      const { lat, lon } = req.body;
      if (typeof lat !== "number" || typeof lon !== "number") return res.status(400).json({ error: "Invalid coordinates" });
      await storage.updatePlayerLocation(req.params.uid, lat, lon);
      res.json({ success: true });
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.patch("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.updatePlayer(parseInt(req.params.id), req.body);
      if (!player) return res.status(404).json({ error: "Player not found" });
      res.json(player);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Leaderboard
  app.get("/api/leaderboard/:gameType", async (req, res) => {
    try {
      const { gameType } = req.params;
      if (gameType !== "online" && gameType !== "realLife") return res.status(400).json({ error: "Use 'online' or 'realLife'" });
      const limit = parseInt(req.query.limit as string) || 50;
      res.json(await storage.getLeaderboard(gameType, limit));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Games
  app.post("/api/games", async (req, res) => {
    try { res.json(await storage.createGame(insertGameSchema.parse(req.body))); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/games/player/:playerId/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      res.json(await storage.getPlayerGames(parseInt(req.params.playerId), limit));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGameById(parseInt(req.params.id));
      if (!game) return res.status(404).json({ error: "Game not found" });
      res.json(game);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.patch("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.updateGame(parseInt(req.params.id), req.body);
      if (!game) return res.status(404).json({ error: "Game not found" });
      res.json(game);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/games/:id/finish", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { winnerId, gameType } = req.body;
      if (!winnerId || !gameType) return res.status(400).json({ error: "winnerId and gameType required" });
      const game = await storage.getGameById(gameId);
      if (!game) return res.status(404).json({ error: "Game not found" });
      await storage.finishGame(gameId, winnerId);
      const loserId = game.player1Id === winnerId ? game.player2Id : game.player1Id;
      await storage.updatePlayerStats(winnerId, gameType, true);
      await storage.updatePlayerStats(loserId, gameType, false);
      res.json({ success: true });
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Chat
  app.post("/api/chat/messages", async (req, res) => {
    try { res.json(await storage.createChatMessage(insertChatMessageSchema.parse(req.body))); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/chat/game/:gameId", async (req, res) => {
    try { res.json(await storage.getGameMessages(parseInt(req.params.gameId))); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Pings
  app.post("/api/pings", async (req, res) => {
    try {
      const { toPlayerId, sound = "default" } = req.body || {};
      if (!Number.isInteger(toPlayerId)) return res.status(400).json({ error: "toPlayerId required" });
      res.json(await storage.createPing({ toPlayerId, sound: String(sound) }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/pings", async (req, res) => {
    try {
      const toPlayerId = Number(req.query.toPlayerId);
      if (!Number.isFinite(toPlayerId)) return res.status(400).json({ error: "toPlayerId query required" });
      res.json(await storage.listPings(toPlayerId));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Tournaments
  app.post("/api/tournaments/digital", async (req, res) => {
    try {
      const { playerIds } = req.body || {};
      if (!Array.isArray(playerIds) || playerIds.length < 2) return res.status(400).json({ error: "playerIds must be array >=2" });
      res.json(await storage.createTournament({ type: "digital", playerIds }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/tournaments/live", async (req, res) => {
    try {
      const { playerIds, venueName } = req.body || {};
      if (!Array.isArray(playerIds) || playerIds.length < 2) return res.status(400).json({ error: "playerIds must be array >=2" });
      res.json(await storage.createTournament({ type: "live", playerIds, venueName: String(venueName || "") }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const t = await storage.getTournament(Number(req.params.id));
      if (!t) return res.status(404).json({ error: "Not found" });
      res.json(t);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/tournaments/:tId/matches/:mId/result", async (req, res) => {
    try {
      const { winnerPlayerId } = req.body || {};
      if (!Number.isInteger(winnerPlayerId)) return res.status(400).json({ error: "winnerPlayerId required" });
      res.json(await storage.reportTournamentResult({ tournamentId: Number(req.params.tId), matchId: Number(req.params.mId), winnerPlayerId }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/tournaments/:tId/matches/:mId/table", async (req, res) => {
    try {
      const { tableNumber } = req.body || {};
      if (!Number.isInteger(tableNumber)) return res.status(400).json({ error: "tableNumber required" });
      res.json(await storage.assignTournamentTable({ tournamentId: Number(req.params.tId), matchId: Number(req.params.mId), tableNumber }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Flyers
  app.get("/api/flyers", async (_req, res) => {
    try { res.json(await storage.listFlyers()); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/flyers", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: "Image data required" });
      res.json(await storage.createFlyer({ image_data: image }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.delete("/api/flyers/:id", async (req, res) => {
    try { await storage.deleteFlyer(Number(req.params.id)); res.json({ success: true }); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Merch
  app.get("/api/merch", async (_req, res) => {
    try { res.json(await storage.listMerch()); } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.post("/api/merch", async (req, res) => {
    try {
      const { name, price, image } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });
      res.json(await storage.createMerch({ name, price: price || "TBD", image_data: image || "" }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.patch("/api/merch/:id/price", async (req, res) => {
    try {
      const { price } = req.body;
      res.json(await storage.updateMerchPrice(Number(req.params.id), price));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
}
