import { verifyEmailAction } from "@/app/actions/authAction";

type PageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await verifyEmailAction(params.token ?? null);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        {result.status === "success" ? (
          <>
            <h1 className="text-2xl font-semibold text-green-600">
              Email Verified 🎉
            </h1>
            <p className="mt-2">{result.data.message}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-red-600">
              Verification Failed
            </h1>
            <p className="mt-2">{result.error as string}</p>
          </>
        )}
      </div>
    </div>
  );
}
