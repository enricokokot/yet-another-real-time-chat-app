const handleSignin = async (username, password, passwordAgain) => {
  if (!username || !password) {
    throw new Error("Please provide both username and password.");
  }

  if (password !== passwordAgain) {
    throw new Error("Please provide equal passwords.");
  }

  const requestBody = {
    username,
    password,
    passwordAgain,
  };

  try {
    const response = await fetch("http://127.0.0.1:80/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to signin. Please try again.");
    }

    const responseData = await response.text();
    if (
      responseData ===
      `{"message":"User successfully created.","user":{"detail":"Username already registered"}}`
    ) {
      throw new Error(`{"message":"User already exists!"}`);
    }

    if (responseData == `{"message":"User already exists!"}`) {
      throw new Error(responseData);
    }

    return responseData;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default handleSignin;
