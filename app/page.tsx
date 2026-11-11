export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">
          {appName || "My Frontend Dummy"}
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome to my Next.js application.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              Application is running!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}