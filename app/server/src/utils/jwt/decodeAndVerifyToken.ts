import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import "dotenv/config";
import fs from "fs";
// @ts-ignore
import Cookies from "cookies";

export const decodeAndVerifyToken = (req: Request, res: Response, next?: () => void) => {
  const PUBLIC_KEY = fs.readFileSync("./clerk_public_key.pem");
  if (!PUBLIC_KEY)
    throw new Error(
      "No PUBLIC_KEY provided. Clerk JWT PUBLIC_KEY needed in root of server directory."
    );

  const cookies = new Cookies(req, res);
  const sessionToken = cookies.get("__session");

  const handleError = (status: number, error: any) => {
    if (next) {
      res.status(status).send(error);
    } else {
      return;
    }
  };

  const token = req.headers["authorization"];
  if (token === undefined && sessionToken === undefined) {
    handleError(400, "Access token/session not provided.");
  }

  try {
    let decoded: string | JwtPayload;
    if (token) {
      decoded = jwt.verify(token.split(" ")[1], PUBLIC_KEY, { algorithms: ["RS256"] });
    } else {
      decoded = jwt.verify(sessionToken, PUBLIC_KEY, { algorithms: ["RS256"] });
    }

    if (next) {
      next();
    } else {
      return decoded;
    }
  } catch (err) {
    handleError(500, err);
  }
};
