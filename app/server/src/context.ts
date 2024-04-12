import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

// export const createContext = ({ req, res }: CreateExpressContextOptions) => {
//   return {
//     req,
//     res,
//     isAdming: true,
//   };
// };
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const data = decodeAndVerifyToken(req, res);
  return data ? { req, res, user: data } : null;
  // async function getUserFromHeader() {
  //   // if (req.headers.authorization) {
  //   const user = decodeAndVerifyToken(req, res);
  //   return user || null;
  //   // return user;
  //   // }
  // }
  // const user = await getUserFromHeader();
  // return { req, res, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
