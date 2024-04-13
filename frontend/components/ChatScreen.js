import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import ChatHistory from "./ChatHistory";
import handleGettingChatHistory from "../api/getchat";
import handleSendMessage from "../api/sendmessage";
import Circle from "./Circle";
import handleCreateChat from "../api/createchat";

const ChatScreen = ({
  subject,
  currentUser,
  connection,
  inbox,
  token,
  pageNumber,
  setPageNumber,
  setInbox,
  isUserSelected,
  setUsersExceptUser,
  setChats,
  usersExceptUser,
  changeSubject,
  chats,
}) => {
  const [text, onChangeText] = useState("");
  const [currentChat, setCurrentChat] = useState([]);
  const inputRef = useRef();
  const [newMessageReceived, setNewMessageReceived] = useState(false);

  useEffect(() => {
    if (chats.map((chat) => chat.id).includes(subject)) {
      getChatHistory(currentUser.username, subject);
    } else {
      setCurrentChat([]);
    }
  }, [subject]);

  useEffect(() => {
    if (
      inbox.length !== 0 &&
      inbox.map((message) => message.data.toId).includes(subject)
    ) {
      const newMessage = {
        ...inbox[inbox.length - 1].data,
        id: currentChat.length ? currentChat[0].id + 1 : 1,
      };
      setCurrentChat([newMessage, ...currentChat]);
      setNewMessageReceived((prev) => !prev);
    }
  }, [inbox]);

  useEffect(() => {
    setInbox((previousInbox) =>
      previousInbox.filter((message) => message.data.toId !== subject)
    );
  }, [newMessageReceived]);

  const getChatHistory = async (user, subject) => {
    if (!user || !subject) {
      console.log("user or subject is empty!");
      return;
    }
    try {
      const data = await handleGettingChatHistory(
        currentUser.id,
        subject,
        token,
        pageNumber
      );
      const parsedData = JSON.parse(data);
      const chatHistory = parsedData;
      setCurrentChat(chatHistory.map((message) => message));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = async () => {
    const containsNewSubject = [];
    if (isUserSelected) {
      setUsersExceptUser((previousUsers) =>
        previousUsers.filter((user) => user.id !== subject)
      );
      const aNewChat = await handleCreateChat(currentUser.id, [subject], token);
      setChats((previousChats) => [
        {
          id: aNewChat.id,
          users: aNewChat.users,
        },
        ...previousChats,
      ]);
      changeSubject(aNewChat.id);
      containsNewSubject.push(aNewChat.id);
    } else {
      containsNewSubject.push(subject);
    }
    console.log("ChatScreen.js: containsNewSubject: ", containsNewSubject);
    const newSubject = containsNewSubject[0];
    const data = {
      fromId: currentUser.id,
      toId: newSubject,
      content: text,
    };

    inputRef.current.clear();

    const wholeData = {
      type: "message",
      data: data,
    };

    connection.send(JSON.stringify(wholeData));

    await handleSendMessage(data.fromId, newSubject, data.content, token);
    setCurrentChat((previousChat) => [
      {
        id: currentChat.length ? currentChat[0].id + 1 : 1,
        fromId: currentUser.id,
        toId: newSubject,
        content: text,
        // createdAt: new Date().toISOString(),
      },
      ...previousChat,
    ]);
  };

  const loadMoreItems = async () => {
    const data = await handleGettingChatHistory(
      currentUser.id,
      subject,
      token,
      pageNumber + 1
    );
    const parsedData = JSON.parse(data);
    const chatHistory = parsedData;
    chatHistory.length > 14 && setPageNumber(pageNumber + 1);
    setCurrentChat((previousChat) => [
      ...previousChat,
      ...chatHistory.filter(
        (message) =>
          !currentChat.map((message) => message.id).includes(message.id)
      ),
    ]);
  };

  return (
    subject && (
      <View style={styles.container}>
        <ChatHistory
          currentUser={currentUser.id}
          currentChat={currentChat}
          loadMoreItems={loadMoreItems}
          newMessageReceived={newMessageReceived}
        />
        <View style={styles.sender}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              onChangeText={onChangeText}
              onSubmitEditing={handleSend}
            />
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Pressable onPress={handleSend}>
              <Circle style={{ width: 35, height: 35 }} content={"🚀"} />
            </Pressable>
          </View>
        </View>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sender: {
    height: 50,
    flexDirection: "row",
    backgroundColor: "#e8f3fd",
  },
  input: {
    outlineColor: "transparent",
    outlineWidth: 0,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flex: 9,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});

export default ChatScreen;
