var express = require("express");
var router = express.Router();
const User = require("../models/user.model");
const utils = require("../lib/utils");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ CUS_EMAIL: req.body.email });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "The email you entered is not registered.",
      });
    }

    // Function defined at bottom of app.js
    const isValid = await utils.validPassword(req.body.password, user.PASSWORD);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        msg: "The password you entered is not correct",
      });
    }
    const isVerified = user.IS_VERIFIED === true;
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        msg: "Your email isn't verified. Please confirm your email.",
      });
    }
    const isLocked = user.IS_LOCKED === true;
    if (isLocked) {
      return res.status(400).json({
        success: false,
        msg: "Your account is locked.",
      });
    }
    const tokenObject = utils.issueJWT(user);
    return res.status(200).json({
      success: true,
      _id: user._id,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
    });
  } catch (err) {
    next(err);
  }
});
router.post("/signup", async (req, res, next) => {
  const hashedPassword = await utils.genPassword(req.body.password);
  const user = new User({
    CUS_EMAIL: req.body.email,
    PASSWORD: hashedPassword,
    CUS_NAME: req.body.name,
    CUS_PHONE: req.body.phone,
    CUS_ADDRESS: req.body.address,
    IS_VERIFIED: false,
    IS_LOCK: false,
  });
  user.save(function (err) {
    if (err) return res.status(404).send(err);
  });
  utils.sendVerificationEmail(user);
  res.status(200).json({
    success: true,
    msg: "Signed up successfully",
  });
});
router.get("/confirmation/:token", async (req, res) => {
  try {
    const _id = utils.verifyEmail(req.params.token);
    await User.updateOne({ _id: _id }, { $set: { IS_VERIFIED: true } });
  } catch (e) {
    res.send("error");
  }
  return res.redirect(process.env.CLIENT_URL + "login");
});
router.post("/forgot-password", async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ CUS_EMAIL: req.body.email });
  } catch (err) {
    next(err);
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      msg: "The email you entered is not registered.",
    });
  }
  const isLocked = user.IS_LOCKED === true;
  if (isLocked) {
    return res.status(400).json({
      success: false,
      msg: "Your account is locked.",
    });
  }
  const isVerified = user.IS_VERIFIED === true;
  if (!isVerified) {
    return res.status(400).json({
      success: false,
      msg: "Your email isn't verified. Please confirm your email.",
    });
  }
  utils.sendPasswordResetEmail(user);
  res.status(200).json({
    success: true,
    msg: "Please check your email.",
  });
});
router.get("/check-reset-password/:token", async (req, res, next) => {
  const check = await utils.verifyResetToken(req.params.token);

  if (check.user) {
    return res.status(200).json({
      success: true,
      msg: "Valid token",
    });
  } else {
    return res.status(400).json({
      success: false,
      msg: "Invalid token",
    });
  }
});
router.post("/reset-password/:token", async (req, res, next) => {
  const data = await utils.verifyResetToken(req.params.token);
  const hashedPassword = await utils.genPassword(req.body.password);
  console.log(data);
  try {
    await User.updateOne(
      { _id: data.user },
      { $set: { PASSWORD: hashedPassword } }
    );
  } catch (err) {
    return res.send(err);
  }
  return res.status(200).json({
    success: true,
    msg: "Your password is successfully renewed.",
  });
});
module.exports = router;
