"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthError } from "@/hooks/use-auth-error";
import { EyeIcon, EyeOffIcon, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

export function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    authError,
    clearError,
    setCredentialsError,
    setMissingInfoError,
    setCustomError,
  } = useAuthError();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // Handle session-based redirect with client-side navigation
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const redirectPath = determineRedirectPath(session.user.role.toString());
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
    }
  }, [status, session]);

  // Helper function to determine redirect path based on role
  const determineRedirectPath = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "/admin/dashboard";
      case "TEACHER":
        return "/teacher/dashboard";
      case "STUDENT":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      setMissingInfoError();
      return;
    }

    try {
      setIsLoading(true);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Try direct login as fallback
        const directLoginResponse = await fetch("/api/auth/direct-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const directLoginResult = await directLoginResponse.json();

        if (directLoginResult.success) {
          toast({
            title: "Login Successful",
            description: "Redirecting to dashboard...",
          });

          // Use direct navigation to avoid router issues
          window.location.href = directLoginResult.redirect;
        } else {
          setCredentialsError();
        }
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });

        // The session will update automatically and the useEffect above will handle redirect
      }
    } catch (error) {
      console.error("Login error:", error);
      setCustomError(
        "Login Failed",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Loading...</h2>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-xl border-t-4 border-t-purple-500">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome to EduSync
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert
                variant="destructive"
                className="mb-6 shadow-md border-red-300 text-red-800 bg-red-50"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-medium">
                  {authError.title}
                </AlertTitle>
                {authError.message && (
                  <p className="text-sm mt-1">{authError.message}</p>
                )}
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
