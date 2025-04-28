import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({
    status: "success",
    message: "Cookies cleared",
  });

  // Clear NextAuth cookies
  const cookiesToClear = [
    "next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.callback-url",
    "__Secure-next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.delete(name);

    // Also try with different paths
    response.cookies.set({
      name,
      value: "",
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set({
      name,
      value: "",
      expires: new Date(0),
      path: "/api",
    });

    response.cookies.set({
      name,
      value: "",
      expires: new Date(0),
      path: "/api/auth",
    });
  });

  return response;
}
