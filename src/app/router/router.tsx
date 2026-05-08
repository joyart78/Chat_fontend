import { createBrowserRouter, Outlet } from "react-router";
import { LoginForm } from "@/features/auth/login/ui";
import { RequireAuth } from "@/app/router/RequireAuth.tsx";
import { RegistrationForm } from "@/features/auth/registration";
import { ChatWindow } from "@/features/chat";

const router = createBrowserRouter([
  { path: "/login", element: <LoginForm /> },
  { path: "/registration", element: <RegistrationForm /> },

  {
    path: "/",
    element: (
      <RequireAuth>
        <div className="protected-layout">
          <Outlet />
        </div>
      </RequireAuth>
    ),
    children: [{ path: "chat", element: <ChatWindow /> }],
  },
]);

export default router;
