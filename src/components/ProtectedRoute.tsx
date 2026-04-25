import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "./AppLayout";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
};