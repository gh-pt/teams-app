import { LoginForm } from "./component/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-black">
        <Image
          src="/logos/logo-transparent-1.png"
          alt="Image"
          className="dark:brightness-[0.2] dark:grayscale mb-4"
          width={300}
          height={300}
        />
        <span className="text-white text-2xl font-bold">Teams-App</span>
      </div>
    </div>
  );
}
