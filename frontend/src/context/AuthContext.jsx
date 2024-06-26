import React, {
  createContext,
  useMemo,
  useContext,
  useState,
  useEffect,
} from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const storedUserType = localStorage.getItem("userType");
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(storedUserType || null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchProfileData = async (userType) => {
    const profileCacheKey = `profileData-${userType}`;
    const savedProfileData = sessionStorage.getItem(profileCacheKey);
    if (savedProfileData) {
      try {
        const profileData = JSON.parse(savedProfileData);
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to parse profile data from cache", error);
      }
    } else {
      try {
        const profileData = await authService.getProfileData(userType);
        if (profileData && Object.keys(profileData).length) {
          sessionStorage.setItem(profileCacheKey, JSON.stringify(profileData));
          setProfile(profileData);
        } else {
          console.error("No profile data received");
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true); // Start with loading state
        // Attempt to fetch current user based on session cookie
        const userData = await authService.fetchCurrentUser();

        if (userData.authenticated) {
          setCurrentUser(true);
          setUserType(userData.currentUserType);

          await fetchProfileData(userData.currentUserType); // Fetch additional profile data if needed
        } else {
          // This else block may not be necessary if the catch block is used for handling errors,
          // but it's here for explicit handling of any non-authenticated but successful responses.
          setCurrentUser(false);
          setUserType(null); // or "unknown", based on your preference
        }
      } catch (error) {
        console.error("Failed to fetch current user", error);
        setCurrentUser(false); // If there's an error, assume the user is not authenticated
        setUserType(null); // Set userType to null or "unknown" when there's an error
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    initializeAuth();
  }, []);

  const register = async (userType, signUpData) => {
    try {
      const data = await authService.register(userType, signUpData);
      // setCurrentUser(data); // Set user data as per your API
      // setUserType(userType);

      return data;
    } catch (error) {
      console.error("Signup failed", error);
      throw error;
    }
  };

  const login = async (userType, credentials) => {
    try {
      const data = await authService.login(userType, credentials);

      await fetchProfileData(userType);
      setCurrentUser(data.authenticated); // Set user data as per your API
      setUserType(data.userType);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async (userType) => {
    try {
      await authService.logout(userType);
      sessionStorage.clear();
      setCurrentUser(null);
      setUserType(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout failed", error);
      throw error;
    }
  };

  const updateProfile = async (userType, profileData) => {
    const profileCacheKey = `profileData-${userType}`;
    try {
      const response = await authService.updateProfileData(
        userType,
        profileData
      );
      if (response && response.data) {
        sessionStorage.setItem(profileCacheKey, JSON.stringify(response.data));
        setProfile(response.data);
        return response;
      } else {
        throw new Error("No response received from the server.");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      userType,
      setUserType,
      login,
      register,
      logout,
      loading,
      profile,
      setProfile,
      updateProfile,
    }),
    [profile, userType, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
