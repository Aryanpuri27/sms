"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, Home, AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleGoHome = () => {
    if (session?.user?.role) {
      // Redirect to appropriate dashboard based on role
      switch (session.user.role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "TEACHER":
          router.push("/teacher/dashboard");
          break;
        case "STUDENT":
          router.push("/student/dashboard");
          break;
        default:
          router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center animate-fadeIn">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-md">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Access Denied
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-sm">
            You don't have permission to access this page with your current
            role.
          </p>
        </div>

        <div className="mt-8 flex flex-col space-y-4 animate-fadeIn delay-100">
          <Button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>

        {status === "loading" && (
          <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4 animate-pulse">
            <p className="text-blue-600">Checking authentication status...</p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-center text-amber-600 mb-2">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="font-medium">You are not signed in</p>
            </div>
            <p className="text-sm text-amber-600">
              Please log in to access the system
            </p>
            <Button
              className="mt-3 bg-amber-500 hover:bg-amber-600 w-full"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        )}

        {session?.user && (
          <div className="mt-8 rounded-md border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-medium text-gray-700 mb-3">Current Session</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-sm text-gray-500">User:</p>
                <p className="font-medium text-gray-800">
                  {session.user.name || session.user.email}
                </p>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-sm text-gray-500">Email:</p>
                <p className="font-medium text-gray-800">
                  {session.user.email}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Role:</p>
                <p className="font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
                  {session.user.role}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Your current role doesn't have permission to access the requested
              page. Please contact an administrator if you believe this is an
              error.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
