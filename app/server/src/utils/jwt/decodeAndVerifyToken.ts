// @ts-ignore
import Cookies from "cookies";
import jwt, { JwtPayload, decode } from "jsonwebtoken";
import { Request, Response } from "express";
import "dotenv/config";
import fs from "fs";

export const decodeAndVerifyToken = (req: Request, res: Response) => {
  const PUBLIC_KEY = fs.readFileSync("./public_key.pem");
  if (!PUBLIC_KEY)
    throw new Error(
      "No PUBLIC_KEY provided. Clerk JWT PUBLIC_KEY needed in root of server directory."
    );

  const cookies = new Cookies(req, res);
  const sessionToken = cookies.get("__session");

  const token = req.headers["authorization"];
  if (token === undefined && sessionToken === undefined) {
    console.log("No token nor session TOkken");
    return;
  }

  try {
    let decoded: string | JwtPayload;
    if (token) {
      decoded = jwt.verify(token.split(" ")[1], PUBLIC_KEY, { algorithms: ["RS256"] });
    } else {
      decoded = jwt.verify(sessionToken, PUBLIC_KEY, { algorithms: ["RS256"] });
    }
    return decoded;
  } catch (err) {
    console.log("Error while decoding and veryfing token", err);
    return;
  }
};
