import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginForm from "../components/LoginForm";
import SigninForm from "../components/SigninForm";
import VerticalLine from "../components/VerticalLine";
import ChatApp from "../components/ChatApp";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoggedIn ? (
        <>
          <ChatApp onLogout={handleLogout} />
        </>
      ) : (
        <>
          <LoginForm onLogin={handleLogin} />
          <VerticalLine height={350} color="grey" />
          <SigninForm onLogin={handleLogin} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
