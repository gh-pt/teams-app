import { WrapperProps } from "../interface";

export default function MainWrapper({ children, className }: WrapperProps) {
  return <div className={className}>{children}</div>;
}
