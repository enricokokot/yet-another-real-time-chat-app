const handleConnect = async () => {
  try {
    const response = await fetch(`http://127.0.0.1:80/connect`, {
      method: "GET",
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

export default handleConnect;
