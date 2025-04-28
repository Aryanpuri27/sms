"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type AuthError = {
  title: string;
  message: string;
} | null;

// Error code to human-readable message mapping
const errorMessages: Record<string, AuthError> = {
  CredentialsSignin: {
    title: "Invalid Credentials",
    message:
      "The email or password you entered is incorrect. Please try again.",
  },
  SessionRequired: {
    title: "Authentication Required",
    message: "Please sign in to access this page.",
  },
  AccessDenied: {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
  },
  Default: {
    title: "Authentication Error",
    message: "An error occurred during sign in. Please try again.",
  },
  MissingInfo: {
    title: "Missing Information",
    message: "Please enter both email and password.",
  },
  ServerError: {
    title: "Server Error",
    message: "A server error occurred. Please try again later.",
  },
};

export function useAuthError() {
  const [authError, setAuthError] = useState<AuthError>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get("error");

  // Check for errors in URL and set error message
  useEffect(() => {
    if (errorCode) {
      console.log("Error from URL:", errorCode);
      setError(errorCode);

      // Clear error from URL by replacing the current URL without the error parameter
      const params = new URLSearchParams(window.location.search);
      if (params.has("error")) {
        params.delete("error");
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        router.replace(newUrl);
      }
    }
  }, [errorCode, router]);

  // Set error using predefined codes
  const setError = (code: string) => {
    setAuthError(errorMessages[code] || errorMessages.Default);
  };

  // Set custom error
  const setCustomError = (title: string, message: string) => {
    setAuthError({ title, message });
  };

  // Clear error
  const clearError = () => {
    setAuthError(null);
  };

  return {
    authError,
    setError,
    setCustomError,
    clearError,
    setMissingInfoError: () => setError("MissingInfo"),
    setCredentialsError: () => setError("CredentialsSignin"),
    setServerError: () => setError("ServerError"),
  };
}
