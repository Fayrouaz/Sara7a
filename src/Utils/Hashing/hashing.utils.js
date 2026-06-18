

import bcrypt from "bcrypt";

export const hash = async({ plainText = "", saltRound } = {}) => {
  const rounds = saltRound ?? +process.env.SALTROUTE ?? 10;
  return await bcrypt.hash(plainText, rounds);
};

export const compare = async({ plainText = "", hash = "" } = {}) => {
  return await bcrypt.compare(plainText, hash);
};