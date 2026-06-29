const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Trying MongoDB...");

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB Connected"
    );

  } catch (error) {

    console.error(
      "Mongo Error:",
      error.message
    );

    process.exit(1);
  }
};

module.exports = connectDB;