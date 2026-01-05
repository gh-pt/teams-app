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
import { signupSchema, SignupSchema } from "@/lib/schemas/signupSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: SignupSchema) {
    // const { confirmPassword, ...rest } = data;
    console.log(data);
  }

  return (
    <form className={cn("flex flex-col")} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="name">User Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            {...register("userName")}
            aria-invalid={!!errors.userName}
            aria-errormessage="name-error"
          />
          <FieldError errors={[errors.userName]} />
        </Field>
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
          <FieldError errors={[errors.password]} />
          <FieldDescription>
            Must be at least 6 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            aria-errormessage="confirm-password-error"
          />
          <FieldError errors={[errors.confirmPassword]} />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" className="bg-blue-500" disabled={!isValid}>
            Create Account
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
