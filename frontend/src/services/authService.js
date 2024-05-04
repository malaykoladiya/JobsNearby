import httpClient from "../utils/httpClient";

export const login = async (userType, credentials) => {
  try {
    // Determine the API endpoint based on the user type
    const endpoint =
      userType === "employer" ? "/employer/login" : "/user/login";
    const response = await httpClient.post(endpoint, credentials);
    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logout = async (userType) => {
  try {
    // Determine the API endpoint based on the user type
    const endpoint =
      userType === "employer" ? "/employer/logout" : "/user/logout";
    await httpClient.post(endpoint);
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
};

export const register = async (userType, signUpData) => {
  try {
    // Determine the API endpoint based on the user type
    const endpoint =
      userType === "employer" ? "/employer/register" : "/user/register";
    const response = await httpClient.post(endpoint, signUpData);
    return response.data;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};
export const fetchCurrentUser = async () => {
  try {
    // Making a GET request to a generic endpoint that returns current user's data
    const response = await httpClient.get("/current_user");

    if (response.status === 200) {
      return response.data; // Return the user data
    } else {
      throw new Error("Failed to fetch current user data");
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error; // Rethrow to handle it in the calling context
  }
};

export const fetchCurrentUserWithUserTypeParam = async (userType) => {
  try {
    // Determine the API endpoint based on the user type
    const endpoint =
      userType === "employer" ? "/employer/current" : "/user/current";
    const response = await httpClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user", error);
    throw error;
  }
};

export const getProfileData = async (userType) => {
  try {
    const endpoint =
      userType === "employer" ? "/employer/profile" : "/user/profile";
    const response = await httpClient.get(endpoint);

    if (response.status === 200) {
      // Assuming a 200 OK means successful retrieval
      return response.data;
    } else {
      // Handle non-200 responses here if needed
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    console.error("Failed to fetch profile", error);
    throw error; // Rethrow to ensure the caller can react to different types of errors.
  }
};

export const updateProfileData = async (userType, profileData) => {
  try {
    const endpoint =
      userType === "employer" ? "/employer/profile" : "/user/profile";
    const response = await httpClient.put(endpoint, profileData);

    return response.data;
  } catch (error) {
    console.error("Failed to update job seeker profile", error);
    throw error;
  }
};
