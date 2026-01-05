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

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginSchema) => {
    console.log(data);
  };

  return (
    <form
      className={cn("flex flex-col gap-6")}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 justify-center">
          <div className="flex items-center gap-2 md:hidden mb-4">
            <span>
              <Image
                src="/logos/logo-transparent-1.png"
                alt="Image"
                className="dark:brightness-[0.2] dark:grayscale"
                width={50}
                height={50}
              />
            </span>
            <span className="text-2xl font-bold">Teams-App</span>
          </div>
          <h1 className="text-2xl font-bold">Login to your account</h1>
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
          />
          <FieldError errors={[errors.password]} />
          <FieldDescription>
            Must be at least 6 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" className="bg-blue-500" disabled={!isValid}>
            Login
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
