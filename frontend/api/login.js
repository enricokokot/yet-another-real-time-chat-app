const handleLogin = async (username, password) => {
  if (!username || !password) {
    throw new Error("Please provide both username and password.");
  }

  const requestBody = {
    username,
    password,
  };

  try {
    const response = await fetch("http://127.0.0.1:8010/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to login. Please try again.");
    }

    const responseData = await response.text();

    if (
      responseData == `{"message":"Login failed, user doesn't exist."}` ||
      responseData == `{"message":"Login failed, incorrect password."}`
    ) {
      throw new Error(responseData);
    }
    return responseData;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default handleLogin;
