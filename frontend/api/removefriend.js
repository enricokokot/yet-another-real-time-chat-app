const handleUsersRemovingFriends = async (requestId, responseId) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8010/user/${requestId}/${responseId}`,
      {
        method: "DELETE",
        headers: {
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

export default handleUsersRemovingFriends;