import handleCreateChat from "./createchat";

const handleGettingChatHistory = async (
  port,
  currentUserId,
  chatId,
  token,
  pageNumber
) => {
  try {
    console.log("getchat.js: chatId: ", chatId);

    const realChatId = Array.isArray(chatId)
      ? await handleCreateChat(currentUserId, chatId, token).id
      : chatId;
    const response = await fetch(
      `http://127.0.0.1:${port}/message/${realChatId}/?skip=${
        pageNumber * 15
      }&limit=15`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch. Please try again.");
    }

    const responseData = await response.text();

    if (responseData == `{"message": "Request failed, need both user ids."}`) {
      throw new Error(responseData);
    }
    return responseData;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default handleGettingChatHistory;
