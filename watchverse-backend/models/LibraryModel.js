const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
{
    firebaseUid: {
        type: String,
        required: true,
        index: true,
    },

    tmdbId: {
        type: Number,
        required: true,
    },

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

    seasonHistory: {
        type: Object,
        default: {},
    },

    watchHistory: {
        type: Array,
        default: [],
    },

    episodeRatings: {
        type: Object,
        default: {},
    },

    episodeReviews: {
        type: Object,
        default: {},
    },

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
},
{
    timestamps: true,
}
);

// Prevent duplicate entries for same user + show
librarySchema.index(
    {
        firebaseUid: 1,
        tmdbId: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Library", librarySchema);