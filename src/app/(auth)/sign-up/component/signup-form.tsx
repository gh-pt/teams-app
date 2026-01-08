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
import { registerUser } from "@/app/actions/authAction";
import { LoaderIcon } from "lucide-react";
import { Card } from "@heroui/react";
import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
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

  async function onSubmit(data: SignupSchema) {
    const result = await registerUser(data);

    if (result.status === "success") {
      router.push("/login");
      toast.success("User Registered Sucessfully");
    } else {
      if (Array.isArray(result.error)) {
        result.error.forEach((e) => {
          const field = e.path[0] as keyof SignupSchema;
          setError(field, { message: e.message });
        });
      } else {
        setError("root.serverError", { message: result.error });
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-2")}>
      <Card className="overflow-hidden p-0 bg-[#1c1c1c]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
              </div>
              <Field>
                <FieldLabel htmlFor="username">User name</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="John Doe"
                  required
                  {...register("userName")}
                  aria-invalid={!!errors.userName}
                  aria-errormessage="username-error"
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
                <Field className="grid grid-cols-2 gap-4">
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
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      {...register("confirmPassword")}
                      aria-invalid={!!errors.confirmPassword}
                      aria-errormessage="confirm-password-error"
                    />
                    <FieldError errors={[errors.confirmPassword]} />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 6 characters long.
                </FieldDescription>
              </Field>
              <FieldError
                className="text-center"
                errors={[errors.root?.serverError]}
              />
              <Field>
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="bg-white text-black hover:bg-gray-300 hover:cursor-pointer"
                >
                  {isSubmitting && <LoaderIcon className="animate-spin" />}{" "}
                  Create Account
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-500 hover:underline hover:text-blue-400!"
                >
                  Sign in
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
