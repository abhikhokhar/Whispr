import { Toaster } from "sonner";
import AuthProvider from "@/context/AuthProvider";
import { SocketProvider } from "@/context/SocketProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <SocketProvider>
        
        {children}
        </SocketProvider>
        <Toaster />
      </div>
    </AuthProvider>
  );
}