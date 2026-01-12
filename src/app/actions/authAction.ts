"use server";

import { signIn } from "@/auth";
import { User } from "@/generated/prisma/client";
import { sendVerificationMail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { signupSchema, SignupSchema } from "@/lib/schemas/signupSchema";
import { generateToken } from "@/lib/token";
import { ActionResult } from "@/types";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { ZodIssue } from "zod/v3";

const avatars = [
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/3.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/3.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/4.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/4.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/5png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/5.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/7.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/7.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/8.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/9.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/9.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/11.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/11.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/male/12.png",
  "https://d2u8k2ocievbld.cloudfront.net/memojis/female/12.png",
];

export async function registerUser(
  data: SignupSchema
): Promise<ActionResult<User>> {
  try {
    const validated = signupSchema.safeParse(data);

    if (!validated.success) {
      return { status: "error", error: validated.error.issues as ZodIssue[] };
    }

    const { userName, email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { status: "error", error: "User already exists." };
    }
    const hasedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        userName,
        email,
        password: hasedPassword,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
      },
    });

    const verificationToken = await generateToken(email);
    await sendVerificationMail(email, verificationToken.token);

    return { status: "success", data: user };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "Something went wrong" };
  }
}

export async function loginUser(
  data: LoginSchema
): Promise<ActionResult<string>> {
  const validated = loginSchema.safeParse(data);

  if (!validated.success) {
    return {
      status: "error",
      error: validated.error.issues as ZodIssue[],
    };
  }

  try {
    const existingUser = await getUserByEmail(validated.data.email);

    if (!existingUser) {
      return { status: "error", error: "User not found" };
    }

    if (!existingUser.emailVerified) {
      const verificationToken = await generateToken(existingUser.email);
      console.log(
        await sendVerificationMail(existingUser.email, verificationToken.token)
      );
      return { status: "error", error: "Please verify your email address" };
    }

    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    return {
      status: "success",
      data: "User logged in successfully",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            status: "error",
            error: "Invalid credentials",
          };
        default:
          return {
            status: "error",
            error: "Something went wrong",
          };
      }
    }
    return {
      status: "error",
      error: "Something else went wrong",
    };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

type VerifyEmailResult = {
  message: string;
};

export async function verifyEmailAction(
  token: string | null
): Promise<ActionResult<VerifyEmailResult>> {
  if (!token) {
    return {
      status: "error",
      error: "Verification token is missing.",
    };
  }

  const verificationToken = await prisma.token.findFirst({
    where: { token },
  });

  if (!verificationToken) {
    return {
      status: "error",
      error: "Invalid verification token.",
    };
  }

  if (verificationToken.expires <= new Date()) {
    await prisma.token.delete({
      where: { id: verificationToken.id },
    });

    return {
      status: "error",
      error: "Verification token has expired. Please request a new one.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.email },
  });

  if (!user) {
    await prisma.token.delete({
      where: { id: verificationToken.id },
    });

    return {
      status: "error",
      error: "User not found.",
    };
  }

  if (user.emailVerified) {
    await prisma.token.delete({
      where: { id: verificationToken.id },
    });

    return {
      status: "error",
      error: "Your email is already verified.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: new Date() },
    }),
    prisma.token.delete({
      where: { id: verificationToken.id },
    }),
  ]);

  return {
    status: "success",
    data: {
      message: "Your email has been verified successfully.",
    },
  };
}
