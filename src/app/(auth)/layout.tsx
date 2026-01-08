export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-black">{children}</div>;
}
