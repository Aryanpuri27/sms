import { ClientLoginPage } from "./logincom";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// Main page component (server component)
export default function LoginPage() {
  return <ClientLoginPage />;
}
