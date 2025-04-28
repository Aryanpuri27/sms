"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState({
    nextAuthSecret: false,
    nextAuthUrl: false,
    nodeEnv: process.env.NODE_ENV || "unknown",
    checkTime: new Date().toLocaleTimeString(),
  });
  const [isChecking, setIsChecking] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  // Check environment status by making an API call
  const checkEnvStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/auth/check-env");
      if (response.ok) {
        const data = await response.json();
        setEnvStatus({
          nextAuthSecret: data.hasNextAuthSecret,
          nextAuthUrl: data.hasNextAuthUrl,
          nodeEnv: data.nodeEnv,
          checkTime: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      console.error("Failed to check environment:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Check on initial load
  useEffect(() => {
    checkEnvStatus();
  }, []);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Button
        variant="outline"
        size="sm"
        className="mb-2 ml-auto flex items-center bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
        onClick={toggle}
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Auth Debug
        {isOpen ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <Alert className="bg-white shadow-lg border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="flex justify-between items-center">
            <span>NextAuth Environment</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={checkEnvStatus}
              disabled={isChecking}
            >
              <RefreshCw
                className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 text-sm space-y-2">
              <div className="flex justify-between">
                <span>NEXTAUTH_SECRET:</span>
                <span
                  className={
                    envStatus.nextAuthSecret ? "text-green-600" : "text-red-600"
                  }
                >
                  {envStatus.nextAuthSecret ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NEXTAUTH_URL:</span>
                <span
                  className={
                    envStatus.nextAuthUrl ? "text-green-600" : "text-red-600"
                  }
                >
                  {envStatus.nextAuthUrl ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NODE_ENV:</span>
                <span>{envStatus.nodeEnv}</span>
              </div>
              <div className="text-xs mt-3 text-gray-500">
                <p>
                  If any values are missing, check your .env file configuration.
                </p>
                <p className="mt-1">Last checked: {envStatus.checkTime}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
