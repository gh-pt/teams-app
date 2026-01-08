"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { loginSchema, LoginSchema } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";
import { loginUser } from "@/app/actions/authAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const { update } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = await loginUser(data);
    if (result.status === "success") {
      update();
      router.replace("/");
      toast.success("User Logged In Sucessfully");
    } else {
      if (Array.isArray(result.error)) {
        result.error.forEach((e) => {
          toast.error(e.message);
        });
      } else {
        toast.error(result.error);
      }
    }
  };
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0 bg-[#1c1c1c] text-white border-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  aria-errormessage="email-error"
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                  aria-invalid={!!errors.password}
                  aria-errormessage="password-error"
                />
                <FieldDescription>
                  Must be at least 6 characters long.
                </FieldDescription>
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="bg-white text-black hover:bg-gray-300 hover:cursor-pointer"
                >
                  {isSubmitting && <LoaderIcon className="animate-spin" />}
                  Login
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-blue-500 hover:underline hover:text-blue-400!"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden lg:flex flex-col items-center justify-center bg-[#1c1c1c]">
            <Image
              src="/logos/logo-transparent-1.png"
              alt="Image"
              className="dark:brightness-[0.2] dark:grayscale"
              width={300}
              height={300}
            />
            <span className="text-white text-2xl font-bold">Teams-App</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
