const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
{
    firebaseUid: String,
    tmdbId: Number,

    title: String,
    poster: String,
    type: String,

    tmdbRating: Number,
    imdbRating: Number,
    imdbId: String,

    overview: String,
    genres: [String],
    year: String,
    cast: Array,

    duration: Number,
    runtime: Number,

    status: String,
    isFavorite: Boolean,

    queuePosition: Number,

    watchedEpisodes: Number,
    totalEpisodes: Number,

    currentSeason: Number,
    currentEpisode: Number,
    totalSeasons: Number,

    currentMinute: Number,
    currentTime: Number,

    seasons: Array,

    seasonHistory: Object,

    watchHistory: Array,

    episodeRatings: Object,
    episodeReviews: Object,

    userRating: Number,
    userReview: String,

    sentiment: String,

    startedAt: Date,
    completedAt: Date,
    lastWatchedAt: Date,

    rewatchCount: {
        type: Number,
        default: 0,
    },

    rating: Number
},
{
    timestamps: true,
});

module.exports = mongoose.model("Library", librarySchema);