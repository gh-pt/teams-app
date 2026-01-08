import Image from "next/image";

export default function Loading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Image
        src="/logos/logo-transparent-1.png"
        alt="Loading"
        width={100}
        height={100}
        loading="eager"
      />
    </div>
  );
}
