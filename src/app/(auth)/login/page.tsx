import Image from "next/image";
import { LoginForm } from "./component/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="relative flex lg:hidden items-center justify-center mb-4">
        <Image
          src="/logos/logo-transparent-1.png"
          alt="Image"
          className="dark:brightness-[0.2] dark:grayscale"
          width={100}
          height={100}
        />
        <span className="text-white text-2xl font-bold">Teams-App</span>
      </div>
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
