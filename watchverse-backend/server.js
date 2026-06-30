const express = require("express");
const cors = require("cors");
require("dotenv").config();


const connectDB =
require("./config/db");

const userRoutes =
require("./routes/userRoutes");

const libraryRoutes =
require("./routes/libraryRoutes");

const app = express();

console.log(
  "Connecting DB..."
);

connectDB();
app.use(
  cors({
    origin: [
      "https://watchverse-three.vercel.app",
      "https://watchverse-2znyuc9yo-muqsit9.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(
"/api/users",
userRoutes
);

app.use(
"/api/library",
libraryRoutes
);

app.get("/", (req, res) => {
  res.send("WatchVerse API Running");
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Is line ko dhyan se check karo aur update karo
// app.use(cors({
//   origin: "http://localhost:5173", // Aapka React frontend jahan chal raha hai (agar port alag hai, jaise 3000, toh 3000 likhna)
//   credentials: true
// }));