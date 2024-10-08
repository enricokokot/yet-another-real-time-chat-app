const handleUsersMakingFriends = async (port, requestId, responseId, token) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:${port}/user/${requestId}/${responseId}`,
      {
        method: "POST",
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

export default handleUsersMakingFriends;
