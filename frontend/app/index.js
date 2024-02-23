import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import LoginForm from "../components/LoginForm";
import SigninForm from "../components/SigninForm";
import VerticalLine from "../components/VerticalLine";
import ChatApp from "../components/ChatApp";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const handleLogin = (currentUser) => {
    setCurrentUser(currentUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser({});
  };

  return (
    <SafeAreaView style={styles.topContainer}>
      {isLoggedIn ? (
        <>
          <ChatApp onLogout={handleLogout} currentUser={currentUser} />
        </>
      ) : (
        <View style={styles.container}>
          <LoginForm onLogin={handleLogin} />
          <VerticalLine height={350} color="grey" />
          <SigninForm onLogin={handleLogin} />
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
