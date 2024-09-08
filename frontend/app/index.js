import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import LoginForm from "../components/LoginForm";
import SigninForm from "../components/SigninForm";
import VerticalLine from "../components/VerticalLine";
import ChatApp from "../components/ChatApp";
import handleConnect from "../api/connect";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [token, setToken] = useState("");
  const [port, setPort] = useState(0);

  const handleLogin = (currentUser, token) => {
    setCurrentUser(currentUser);
    setToken(token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser({});
  };

  const connectToPort = async () => {
    const port = await handleConnect();
    console.log("Debug: port:", port);
    setPort(parseInt(port));
  };

  useEffect(() => {
    connectToPort();
  }, []);

  return (
    <SafeAreaView style={styles.topContainer}>
      {isLoggedIn ? (
        <>
          <ChatApp
            onLogout={handleLogout}
            currentUser={currentUser}
            token={token}
            port={port}
            setPort={setPort}
          />
        </>
      ) : (
        <View style={styles.container}>
          <LoginForm onLogin={handleLogin} port={port} />
          <VerticalLine height={350} color="grey" />
          <SigninForm onLogin={handleLogin} port={port} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
