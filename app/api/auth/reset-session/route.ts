import { NextResponse } from "next/server";

export async function GET() {
  // Return an HTML that automatically redirects to login and clears browser data
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Session Reset</title>
        <meta http-equiv="refresh" content="1;url=/login" />
      </head>
      <body style="font-family: system-ui, sans-serif; text-align: center; padding-top: 20%;">
        <h2>Resetting session...</h2>
        <p>You will be redirected to the login page in a moment.</p>
        <p>If you are not redirected, <a href="/login">click here</a>.</p>
        <script>
          // Clear all cookies by setting their expiration date to the past
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/api';
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/api/auth';
          });
          
          // Clear localStorage
          try { localStorage.clear(); } catch(e) {}
          
          // Clear sessionStorage
          try { sessionStorage.clear(); } catch(e) {}
          
          // Redirect after a delay
          setTimeout(() => { 
            window.location.href = '/login';
          }, 1500);
        </script>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
