"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthError } from "@/hooks/use-auth-error";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  AlertCircle,
  XCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AuthDebug from "@/components/auth-debug";

// Function to manually check session
async function checkSessionStatus() {
  try {
    const response = await fetch("/api/auth/check-session");
    const data = await response.json();
    console.log("Session check result:", data);
    return data;
  } catch (error) {
    console.error("Error checking session:", error);
    return { authenticated: false, error: String(error) };
  }
}

function LoginForm() {
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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole =
        typeof session.user.role === "string"
          ? session.user.role
          : String(session.user.role);

      const redirectPath = determineRedirectPath(userRole);
      window.location.href = redirectPath;
    }
  }, [status, session]);

  // Helper function to determine redirect path based on role
  const determineRedirectPath = (role: string) => {
    switch (role) {
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

      // Try NextAuth login first
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Fallback to direct login API
        const directLoginResponse = await fetch("/api/auth/direct-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const directLoginResult = await directLoginResponse.json();

        if (directLoginResult.success) {
          toast({
            title: "Login Successful",
            description: "Redirecting to your dashboard...",
            variant: "default",
          });

          // Use direct navigation
          window.location.href = directLoginResult.redirect;
        } else {
          setCredentialsError();
        }
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
          variant: "default",
        });

        // Force a session check and redirect
        const checkSession = await fetch("/api/auth/check-session");
        const sessionData = await checkSession.json();

        if (sessionData.authenticated && sessionData.user?.role) {
          const redirectPath = determineRedirectPath(sessionData.user.role);
          window.location.href = redirectPath;
        }
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      setCustomError(
        "Unexpected Error",
        "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Loading session...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-xl border-t-4 border-t-purple-500 animate-fadeIn">
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
                className="mb-6 animate-bounceIn shadow-md border-red-300 text-red-800 bg-red-50"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-medium">
                  {authError.title}
                </AlertTitle>
                <AlertDescription className="text-sm mt-1">
                  {authError.message}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 hover:bg-red-100 text-red-800"
                  onClick={clearError}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={`pl-10 transition-all duration-200 h-11 ${
                      authError
                        ? "border-red-300 focus-visible:ring-red-300"
                        : "focus-visible:ring-purple-300 border-gray-200"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 transition-all duration-200 h-11 ${
                      authError
                        ? "border-red-300 focus-visible:ring-red-300"
                        : "focus-visible:ring-purple-300 border-gray-200"
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 mt-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.01] focus:scale-[0.99]"
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
      {process.env.NODE_ENV !== "production" && <AuthDebug />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
