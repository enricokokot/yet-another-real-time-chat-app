const handleUsersFetch = async (userId, token) => {
  try {
    const response = await fetch(`http://127.0.0.1:8010/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch. Please try again.");
    }

    const responseData = await response.text();

    return responseData;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default handleUsersFetch;
