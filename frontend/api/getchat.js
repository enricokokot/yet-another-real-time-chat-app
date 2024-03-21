const handleGettingChatHistory = async (
  requestId,
  responseId,
  token,
  pageNumber
) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:80/message/${requestId}/${responseId}/?skip=${
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
