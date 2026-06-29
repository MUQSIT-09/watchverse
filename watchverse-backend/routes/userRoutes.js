const express =
require("express");

const router =
express.Router();

const User =
require("../models/User");

router.post(
"/sync",
async (req, res) => {

try {

const {
firebaseUid,
name,
email,
photoURL,
} = req.body;

let user =
await User.findOne({
  firebaseUid,
});

if (!user) {

  user =
  await User.create({
    firebaseUid,
    name,
    email,
    photoURL,
  });

}

res.json(user);

} catch (error) {

console.log(error);

res.status(500).json({
message:
"Server Error",
});

}

}
);

module.exports =
router;