import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Response } from "express";
import { Member } from "../members/members.model";
import { comparePassword } from "../helpers/passwordUtils";
const verifyHmac256 = require("verify-hmac-sha");

dotenv.config();

export const signToken = (
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  isVerified: boolean,
  isEnabled: boolean,
  profilePic: string,
  role: string
) => {
  const key = process.env.SECRET_KEY || "";
  const token = jwt.sign(
    {
      id,
      firstName,
      lastName,
      phoneNumber,
      email,
      isVerified,
      isEnabled,
      profilePic,
      role,
    },
    key,
    { expiresIn: "1h" }
  );
  return token;
};

export const verifyToken = (req: any, res: Response, next: any) => {
  const key = process.env.SECRET_KEY || "";
  const token = req.headers.authorization || req.params.token;
  if (!token) {
    return res.status(403).json({ status: 403, error: "No token provided" });
  }
  jwt.verify(token, key, (error: any, decoded: any) => {
    if (error) {
      console.log(error);
      res.status(401).json({ status: 401, error: "Unauthorized" });
    } else {
      console.log("decoded");
      console.log(decoded);
      if (decoded.isEnabled === false) {
        console.log("User has been disabled");
        res.status(401).json({
          status: 401,
          error:
            "User has been disabled, contact the admin to enable your account",
        });
      } else {
        req.user = decoded;
        next();
      }
    }
  });
};

export const isAdmin = async (req: any, res: Response, next: any) => {
  if (req.user.role === "Admin") {
    console.log(req.user.role);
    next();
  } else {
    console.log(req.user.role);
    res
      .status(401)
      .json({ status: 401, error: "Unauthorized to access this resource" });
  }
};

export const isAdminOrSubadmin = async (req: any, res: Response, next: any) => {
  if (req.user.role === "Admin" || req.user.role === "SubAdmin") {
    console.log(req.user.role);
    next();
  } else {
    console.log(req.user.role);
    res
      .status(401)
      .json({ status: 401, error: "Unauthorized to access this resource" });
  }
};

export const isExchanger = async (req: any, res: Response, next: any) => {
  if (req.user.role === "Exchanger") {
    console.log(req.user.role);
    next();
  } else {
    console.log(req.user.role);
    res
      .status(401)
      .json({ status: 401, error: "Unauthorized to access this resource" });
  }
};

export const verify = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization || req.params.token;
  if (!token) {
    res.status(403).json({ status: 403, error: "No token provided" });
  } else {
    if (token === process.env.token) {
      next();
    } else {
      res
        .status(401)
        .json({ status: 401, error: "Unauthorized to access this resource" });
    }
  }
};

export const isSetTransactionPinValid = async (
  req: any,
  res: Response,
  next: any
) => {
  try {
    if (req.user.isSetPin === false) {
      //console.log(req.user.role)
      res
        .status(400)
        .json({
          status: 400,
          error: "You need to set a transaction pin, please do that",
        });
    } else {
      if (req.body.pin) {
        const email = req.user.email;
        const Auth = await Member.findOne({ email: email });
        const retrievedPassword = Auth.pin;
        const pin = req.body.pin;
        const isMatch = await comparePassword(pin, retrievedPassword);
        console.log(isMatch);
        if (isMatch) {
          next();
        } else {
          res
            .status(400)
            .json({ status: 400, message: "Invalid transaction pin" });
        }
      } else {
        res
          .status(400)
          .json({
            status: 400,
            message: "Pin must be provided for this transaction",
          });
      }
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ status: 500, message: "Error while validating  pin " });
  }
};

export const VerifySharedSecretCoinBase = async (
  req: any,
  res: Response,
  next: any
) => {
  console.log("signature");
  //console.log(req.headers["x-cc-webhook-signature"])
  console.log("req body");
  // console.log(req.body)
  const secret = process.env.COINBASE_SHARED_SECRET;
  const payload = JSON.stringify(req.body);
  const signature = req.headers["x-cc-webhook-signature"];
  console.log(verifyHmac256.encodeInHex.verify({ signature, secret, payload })); // true
  const sharedSecret = verifyHmac256.encodeInHex.verify({
    signature,
    secret,
    payload,
  });
  if (sharedSecret) {
    next();
  } else {
    console.log("Request not from coinbase");
    res
      .status(401)
      .json({ status: 401, error: "Unauthorized to access this resource" });
  }
};

export const VerifySharedSecretLazerpay = async (
  req: any,
  res: Response,
  next: any
) => {
  console.log("signature lazerpay");
  //console.log(req.headers["x-cc-webhook-signature"])
  console.log("req body");
  // console.log(req.body)
  const secret = process.env.LAZER_SECRET_KEY;
  const payload = JSON.stringify(req.body);
  const signature = req.headers["x-lazerpay-signature"];
  console.log(verifyHmac256.encodeInHex.verify({ signature, secret, payload })); // true
  const sharedSecret = verifyHmac256.encodeInHex.verify({
    signature,
    secret,
    payload,
  });
  if (sharedSecret) {
    next();
  } else {
    console.log("Request not from coinbase");
    res
      .status(401)
      .json({ status: 401, error: "Unauthorized to access this resource" });
  }
};