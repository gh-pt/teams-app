import { randomBytes } from "crypto";
import prisma from "./prisma";

export async function getTokenByEmail(email: string) {
  try {
    return await prisma.token.findFirst({ where: { email } });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateToken(email: string) {
  const token = randomBytes(48).toString("hex");
  const expires = new Date(Date.now() + 60 * 1000 * 60 * 24);
  const existingToken = await getTokenByEmail(email);
  if (existingToken) {
    await prisma.token.delete({ where: { id: existingToken.id } });
  }
  return await prisma.token.create({
    data: {
      email,
      token,
      expires,
    },
  });
}
