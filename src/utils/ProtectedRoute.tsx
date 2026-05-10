import { useContext, type PropsWithChildren } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const auth = useContext(AuthContext);

  if (auth === undefined) {
    throw new Error("ProtectedRoute must be used within an AuthProvider");
  }

  if (auth.isAuthLoading) {
    return (
      <div role="status" aria-live="polite" style={{ padding: "2rem", textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
