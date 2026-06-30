const mongoose =
require("mongoose");

// models/Library.js (example)
const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, index: true },

  tmdbId: { type: Number, required: true, index: true },

  title: { type: String, default: "" },

  poster: { type: String, default: "" },

  type: { type: String, enum: ['tv','movie'], default: 'tv' },

  status: { type: String, default: "plan" },

  isFavorite: { type: Boolean, default: false },

  userReview: { type: String, default: "" },

  rating: { type: Number, default: null },

  runtime: { type: Number, default: 0 },       // seconds (or keep minutes if you prefer)
  duration: { type: Number, default: 0 },      // minutes

  currentTime: { type: Number, default: 0 },
  currentMinute: { type: Number, default: 0 },

  watchedEpisodes: { type: Number, default: 0 },

  totalEpisodes: { type: Number, default: 1 },

  currentSeason: { type: Number, default: 1 },

  currentEpisode: { type: Number, default: 1 },

  totalSeasons: { type: Number, default: 1 },

  queuePosition: { type: Number, default: 1 },

  tmdbRating: { type: Number, default: null },

  imdbId: { type: String, default: null },

  imdbRating: { type: Number, default: null },

  overview: { type: String, default: "" },

  genres: { type: [String], default: [] },

  year: { type: String, default: "" },

  cast: { type: [String], default: [] },

  seasons: { type: Array, default: [] },

  episodeRatings: { type: Object, default: {} },

  episodeReviews: { type: Object, default: {} },

  seasonHistory: { type: Object, default: {} },

  watchHistory: { type: Array, default: [] },

  lastWatchedAt: { type: Date, default: null },
}, {
  timestamps: true
});

// Compound index for faster lookups per user+tmdb
librarySchema.index({ firebaseUid: 1, tmdbId: 1 }, { unique: false });

module.exports = mongoose.model('Library', librarySchema);

module.exports =
mongoose.model(
  "Library",
  librarySchema
);