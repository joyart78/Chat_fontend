import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import type { RootState } from "@/app/store";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useSelector((state: RootState) => !!state.token.isAuth);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
