const handleCreateChat = async (requestId, responseId, token) => {
  try {
    const response = await fetch(`http://127.0.0.1:80/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users: [requestId, ...responseId] }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch. Please try again.");
    }

    const responseData = await response.json();

    if (responseData == `{"message": "Request failed, need both user ids."}`) {
      throw new Error(responseData);
    }
    return responseData.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default handleCreateChat;
