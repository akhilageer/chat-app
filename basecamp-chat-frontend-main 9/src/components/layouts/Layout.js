import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthenticator, Button, Heading, View } from "@aws-amplify/ui-react";

import { useAuth } from "../../contexts/AuthContext";

export function Layout() {
  const { route, signOut, user } = useAuthenticator((context) => [
    context.route,
    context.signOut,
    context.user,
  ]);
  const { currentUser, login, register, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    (async ()=>{
      await handleLogin();
    })()
    
  }, [user]);

  function logOut() {
    logout();
    signOut();
    navigate("/login");
  }

  async function handleLogin() {
    if (!user) return;
    if (!user.attributes) return;
    try {
      await login(user.attributes.email, "123456");
      navigate("/chat");
    } catch (e) {
      await register(user.attributes.email, "123456");
      navigate("/profile");
    }
  }
  return (
    <>
      <nav>
        <Button onClick={() => navigate("/")}>Home</Button>
        {currentUser?.photoURL ? (
          <Button onClick={() => navigate("/chat")}>Chat</Button>
        ) : (
          ""
        )}

        {route !== "authenticated" ? (
          <Button onClick={() => navigate("/login")}>Login</Button>
        ) : (
          <Button onClick={() => logOut()}>Logout</Button>
        )}
      </nav>
      <Heading level={1}>Chat app</Heading>
      <View>
        {route === "authenticated" ? "You are logged in!" : "Please Login!"}
      </View>

      <Outlet />
    </>
  );
}
