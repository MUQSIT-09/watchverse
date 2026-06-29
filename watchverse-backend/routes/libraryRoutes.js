const express = require("express");
const router = express.Router();
const LibraryModel = require("../models/LibraryModel");

// =======================================
// SAVE / UPDATE LIBRARY ITEM
// =======================================
router.post("/save", async (req, res) => {
  try {
    const item = req.body;

    if (!item.firebaseUid || !item.tmdbId) {
      return res.status(400).json({
        error: "Missing firebaseUid or tmdbId",
      });
    }

    console.log("========== SAVE REQUEST ==========");
    console.log(item);

    const savedDoc = await LibraryModel.findOneAndUpdate(
      {
        firebaseUid: item.firebaseUid,
        tmdbId: item.tmdbId,
      },
      {
        $set: item,
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log("========== SAVED DOCUMENT ==========");
    console.log(savedDoc);

    res.json({
      success: true,
      data: savedDoc,
    });
  } catch (err) {
    console.error("SAVE ERROR");
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// =======================================
// GET USER LIBRARY
// =======================================
router.get("/:uid", async (req, res) => {
  try {
    const library = await LibraryModel.find({
      firebaseUid: req.params.uid,
    });

    console.log("========== LIBRARY ==========");
    console.log(JSON.stringify(library, null, 2));

    res.json(library);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;