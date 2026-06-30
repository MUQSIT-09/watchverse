const express = require("express");
const router = express.Router();
const LibraryModel = require("../models/LibraryModel");

// ===============================
// SAVE / UPDATE
// ===============================
router.post("/save", async (req, res) => {
    try {
        const item = req.body;

        if (!item.firebaseUid || !item.tmdbId) {
            return res.status(400).json({
                success: false,
                message: "firebaseUid and tmdbId are required",
            });
        }

        console.log("========== SAVE REQUEST ==========");
        console.log(item);

        console.log("Incoming Fields:");
        console.log(Object.keys(item));

        const savedDoc = await LibraryModel.findOneAndUpdate(
            {
                firebaseUid: item.firebaseUid,
                tmdbId: item.tmdbId,
            },
            {
                $set: item,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log("========== SAVED DOCUMENT ==========");
        console.log(savedDoc.toObject());

        res.json({
            success: true,
            data: savedDoc,
        });

    } catch (err) {

        console.error("SAVE ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// ===============================
// GET USER LIBRARY
// ===============================
router.get("/:uid", async (req, res) => {

    try {

        const library = await LibraryModel.find({
            firebaseUid: req.params.uid,
        }).sort({
            updatedAt: -1,
        });

        console.log("========== LIBRARY ==========");
        console.log(JSON.stringify(library, null, 2));

        res.json(library);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }

});

module.exports = router;