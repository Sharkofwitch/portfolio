"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with email:", email);
      console.log(`Attempting login with email: ${email}, password: [hidden]`);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        console.error("Login failed:", result.error);
        setError("Invalid email or password");
      } else if (result?.ok) {
        console.log(
          "✅ Login successful, waiting for session to be established",
        );

        setError("");
        // Show success state
        const successElement = document.getElementById("login-success");
        if (successElement) {
          successElement.classList.remove("hidden");
        }

        try {
          // Ensure session is fully established before redirect with a longer timeout
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Force a session update before redirect
          console.log("Forcing session update before redirect...");
          const response = await fetch("/api/auth/session");
          const session = await response.json();
          console.log("Current session state:", session);

          console.log("Redirecting to admin dashboard...");
          // Using push instead of replace for more reliable navigation
          router.push("/admin");
          // Refresh after a short delay to ensure the page reloads with the new session
          setTimeout(() => router.refresh(), 500);
        } catch (error) {
          console.error("Error during redirect:", error);
          // Fallback to direct window location change if router fails
          window.location.href = "/admin";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                         border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400
                         text-gray-900 dark:text-white rounded-t-md focus:outline-none 
                         focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
                         dark:bg-gray-800"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                         border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400
                         text-gray-900 dark:text-white rounded-b-md focus:outline-none
                         focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
                         dark:bg-gray-800"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Login success message - hidden by default */}
          <div id="login-success" className="hidden">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Login successful! Redirecting to admin panel...
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                       text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
