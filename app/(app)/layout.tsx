import { Toaster } from "sonner";
import AuthProvider from "@/context/AuthProvider";
import Navbar from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {children}
        <Toaster />
      </div>
    </AuthProvider>
  );
}