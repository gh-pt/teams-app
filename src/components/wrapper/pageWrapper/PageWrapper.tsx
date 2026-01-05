import { WrapperProps } from "../interface";

export default function PageWrapper({ children, className }: WrapperProps) {
  return (
    <div className={`max-w-screen h-screen max-h-screen ${className || ""}`}>
      {children}
    </div>
  );
}
