require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const recipesRouter = require('./routes/recipes');
const memoryWallRouter = require('./routes/memoryWall');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'carol-legacy-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Routes
app.use('/recipes', recipesRouter);
app.use('/memory-wall', memoryWallRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: "Grandma Carol's Legacy Cookbook API is running 💛", version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🍳 Carol's Cookbook API running on port ${PORT}`);
});

module.exports = app;
