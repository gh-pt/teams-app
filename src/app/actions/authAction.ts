"use server";

import { signIn } from "@/auth";
import { User } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { signupSchema, SignupSchema } from "@/lib/schemas/signupSchema";
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
      return {
        status: "error",
        error: "Invalid credentials",
      };
    }

    return {
      status: "error",
      error: "Something went wrong",
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

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
