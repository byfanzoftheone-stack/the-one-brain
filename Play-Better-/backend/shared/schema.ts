import { pgTable, text, doublePrecision, integer, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Players table
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  name: text("name").notNull(),
  skill: text("skill").notNull().default("Beginner"),
  lat: doublePrecision("lat"),
  lon: doublePrecision("lon"),
  status: text("status").notNull().default("offline"),
  onlineWins: integer("online_wins").notNull().default(0),
  onlineLosses: integer("online_losses").notNull().default(0),
  realLifeWins: integer("real_life_wins").notNull().default(0),
  realLifeLosses: integer("real_life_losses").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull(), // 'online' or 'realLife'
  player1Id: integer("player1_id").notNull(),
  player2Id: integer("player2_id").notNull(),
  winnerId: integer("winner_id"),
  state: text("state").notNull().default("waiting"),
  location: text("location"),
  board: jsonb("board"),
  currentTurn: integer("current_turn"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  playerId: integer("player_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertPlayerSchema = createInsertSchema(players, {
  name: z.string().min(1, "Name is required"),
  skill: z.enum(["Beginner", "Intermediate", "Advanced", "Pro"]),
  status: z.enum(["available", "busy", "offline"]),
  lat: z.number().optional(),
  lon: z.number().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPlayerSchema = createSelectSchema(players);

export const insertGameSchema = createInsertSchema(games, {
  gameType: z.enum(["online", "realLife"]),
  state: z.enum(["waiting", "in-progress", "finished"]),
}).omit({ id: true, createdAt: true });

export const selectGameSchema = createSelectSchema(games);

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

export const selectChatMessageSchema = createSelectSchema(chatMessages);

// Types
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Helper types for frontend
export type PlayerWithStats = Player & {
  totalOnlineGames: number;
  totalRealLifeGames: number;
  onlineWinRate: number;
  realLifeWinRate: number;
  distance?: number;
};
