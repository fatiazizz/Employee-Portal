import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
  const { auth } = usePage<SharedData>().props;

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] px-4 py-8 dark:bg-[#0a0a0a]">
        {/* Logo and Title */}
        <div className="mb-10 text-center">
          <img
            src="/logo.png"
            alt="ESS Logo"
            className="mx-auto mb-4 h-24 w-24"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Employee Self-Service System
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage your requests easily and efficiently.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          {auth.user ? (
            <Link
              href={route('dashboard')}
              className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-white font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={route('login')}
                className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-white font-semibold hover:bg-blue-700 transition"
              >
                Login
              </Link>
              <Link
                href={route('register')}
                className="block w-full rounded-lg border border-blue-600 px-6 py-3 text-center text-blue-600 font-semibold hover:bg-blue-50 transition dark:hover:bg-[#1b1b1b]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} ESS Platform — All rights reserved.
        </footer>
      </div>
    </>
  );
}
