const mongoose =
require("mongoose");

const librarySchema =
new mongoose.Schema(
{
  firebaseUid: {
    type: String,
    required: true,
  },

  tmdbId: Number,

  title: String,

  poster: String,

  type: String,

  status: String,

  isFavorite: Boolean,

  userReview: String,

  rating: Number,
},
{
  timestamps: true,
}
);

module.exports =
mongoose.model(
  "Library",
  librarySchema
);