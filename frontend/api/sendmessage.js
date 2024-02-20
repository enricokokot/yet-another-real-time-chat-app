const handleSendMessage = async (requestId, responseId, text) => {
  const data = {
    fromId: requestId,
    toId: responseId,
    content: text,
  };

  try {
    const response = await fetch(`http://127.0.0.1:8010/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

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

export default handleSendMessage;
