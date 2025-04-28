"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";

export default function LoginStatus() {
  const { data: session, status } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const sessionChecked = useRef(false);

  // Only log session once per mount to prevent loops
  useEffect(() => {
    if (status !== "loading" && !sessionChecked.current) {
      sessionChecked.current = true;
      console.log("LoginStatus - Session:", status, session?.user?.email);
    }
  }, [status, session]);

  // Function to fully reset session
  const handleResetSession = () => {
    window.location.href = "/api/auth/reset-session";
  };

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        className={`mb-2 ml-auto flex items-center text-xs ${
          status === "authenticated"
            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            : status === "loading"
            ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {status === "authenticated" ? (
          <ShieldCheck className="mr-1 h-3 w-3" />
        ) : (
          <UserIcon className="mr-1 h-3 w-3" />
        )}
        Session: {status}
        {isExpanded ? (
          <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDown className="ml-1 h-3 w-3" />
        )}
      </Button>

      {isExpanded && status === "authenticated" && session?.user && (
        <div className="bg-white rounded-md shadow-lg border p-3 text-xs w-60">
          <h4 className="font-semibold mb-2">User Information</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{session.user.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{session.user.email || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role:</span>
              <span className="font-medium">{session.user.role || "N/A"}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t text-xxs text-gray-400">
            <p>Session expires: {new Date(session.expires).toLocaleString()}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full h-7 flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleResetSession}
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
