const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const pathToKey = path.join(__dirname, "..", "priv.pem");
const PRIV_KEY = fs.readFileSync(pathToKey, "utf8");
const EMAIL_SECRET = process.env.EMAIL_SECRET;

const salt = 10;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const validPassword = async (password, hash) => {
  const res = await bcrypt.compare(password, hash);
  return res;
};

const genPassword = async (password) => {
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const issueJWT = (user) => {
  const _id = user._id;

  const expiresIn = "1d";

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
};

const sendVerificationEmail = (user) => {
  jsonwebtoken.sign(
    {
      user: user._id,
    },
    EMAIL_SECRET,
    {
      expiresIn: "1d",
    },
    (err, emailToken) => {
      const url = process.env.SERVER_URL + `confirmation/${emailToken}`;
      transporter.sendMail(
        {
          to: user.CUS_EMAIL,
          subject: "Confirm Email",
          html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
        },
        (e) => {
          console.log(e);
        }
      );
    }
  );
};

const verifyEmail = (token) => {
  const data = jsonwebtoken.verify(token, EMAIL_SECRET);
  return data.user;
};

const sendPasswordResetEmail = (user) => {
  jsonwebtoken.sign(
    {
      user: user._id,
    },
    EMAIL_SECRET,
    {
      expiresIn: "1h",
    },
    (err, resetToken) => {
      const url = process.env.CLIENT_URL + `reset-password/${resetToken}`;

      transporter.sendMail({
        to: user.CUS_EMAIL,
        subject: "Password Reset Email",
        html: `<p>We heard that you lost your Ecommerce password. Sorry about that!</p>
              <p>But don’t worry! You can use the following link to reset your password:</p>
              <p><a href="${url}">${url}</a></p>
              <p>If you don’t use this link within 1 hour, it will expire.</p>
              <p>Thanks,</p>
              <p>The Ecommerce Team</p>
              `,
      });
    }
  );
};

const verifyResetToken = async (token) => {
  let data;
  try {
    data = await jsonwebtoken.verify(token, EMAIL_SECRET);
    return data;
  } catch (err) {
    return err;
  }
};

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.sendVerificationEmail = sendVerificationEmail;
module.exports.verifyEmail = verifyEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
module.exports.verifyResetToken = verifyResetToken;
