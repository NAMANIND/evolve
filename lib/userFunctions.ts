// userFunctions.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

// Types
export interface User {
  id?: string;
  name: string;
  weight: number;
  age: number;
  height: number;
  targetWeight: number;
}

export enum ExerciseTypeEnum {
  RUNNING = "RUNNING",
  YOGA = "YOGA",
  CYCLING = "CYCLING",
  STRENGTH = "STRENGTH",
  SWIMMING = "SWIMMING",
  HIIT = "HIIT",
}

export enum IntensityLevel {
  LIGHT = "LIGHT",
  MODERATE = "MODERATE",
  INTENSE = "INTENSE",
}

export interface ExerciseLog {
  id?: string;
  userId: string;
  date: string;
  exerciseType: ExerciseTypeEnum;
  duration: number;
  intensity: IntensityLevel;
  videoUrl?: string;
}

const STORAGE_KEYS = {
  USER: "fitness_app_user",
  USER_LOGS: "fitness_app_user_logs",
} as const;

const API_URL =
  Constants.expoConfig?.extra?.APIURL || "http://13.235.78.233:3000";

export const getConstants = async () => {
  try {
    const response = await fetch(`${API_URL}/api/constants`);
    if (!response.ok) throw new Error("Failed to fetch constants");

    const constants = await response.json();

    return constants;
  } catch (error) {
    console.error("Error fetching constants:", error);
    throw error;
  }
};

// User Functions
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    console.log("userData", userData);
    if (!userData) return null;
    // if (userData) {
    //   clearUserData();
    // }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const updateUser = async (
  userData: User,
  userId: String
): Promise<{}> => {
  try {
    const isConnected = (await NetInfo.fetch()).isConnected;

    if (isConnected) {
      const url = userId
        ? `${API_URL}/api/users/${userId || ""}`
        : `${API_URL}/api/users`;
      const response = await fetch(url, {
        method: userId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const updatedUser = await response.json();
      if (userId) {
        console.log("User Data Updated", updatedUser);
      } else {
        console.log("User Created", updatedUser);
      }

      if (updatedUser._id) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(updatedUser)
        );
        return updatedUser;
      } else {
        return {};
      }
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      return userData;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Log Functions
export const getUserLogs = async (userId: string): Promise<ExerciseLog[]> => {
  try {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (isConnected) {
      const response = await fetch(`${API_URL}/api/exercises/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user logs");

      const logs = await response.json();
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_LOGS}_${userId}`,
        JSON.stringify(logs)
      );
      return logs;
    } else {
      // If offline, get from storage
      const storedLogs = await AsyncStorage.getItem(
        `${STORAGE_KEYS.USER_LOGS}_${userId}`
      );
      return storedLogs ? JSON.parse(storedLogs) : [];
    }
  } catch (error) {
    console.error("Error getting user logs:", error);
    // If error, try to get from storage
    try {
      const storedLogs = await AsyncStorage.getItem(
        `${STORAGE_KEYS.USER_LOGS}_${userId}`
      );
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (e) {
      return [];
    }
  }
};

export const addExerciseLog = async (
  userId: string,
  logData: {}
): Promise<ExerciseLog> => {
  try {
    const isConnected = (await NetInfo.fetch()).isConnected;

    if (!isConnected) {
      throw new Error("Internet connection required to add exercise log");
    }

    console.log("API_URL", API_URL);
    console.log("userId", userId);
    console.log("body", JSON.stringify(logData));

    const response = await fetch(`${API_URL}/api/exercises/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    });

    if (!response.ok) throw new Error("Failed to add exercise log");

    const newLog = await response.json();

    // Update local storage
    const currentLogs = await getUserLogs(userId);
    const updatedLogs = [...currentLogs, newLog];
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.USER_LOGS}_${userId}`,
      JSON.stringify(updatedLogs)
    );

    return newLog;
  } catch (error) {
    console.error("Error adding exercise log:", error);
    throw error;
  }
};

// Utility function to clear all data (for logout)
export const clearUserData = async (): Promise<void> => {
  console.log("clearUserData");
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};

interface UploadResponse {
  videoUrl: string;
  success: boolean;
  message?: string;
}

export const uploadExerciseVideo = async (
  fileUri: string
): Promise<UploadResponse> => {
  try {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected) {
      throw new Error("Internet connection required to upload video");
    }

    console.log("Uploading video from path:", fileUri);

    // Read the file as base64
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Create form data
    const formData = new FormData();
    formData.append("video", {
      uri: fileUri,
      type: "video/mp4",
      name: `video-${Date.now()}.mp4`,
    } as any);

    const uploadResponse = await fetch(`${API_URL}/api/videos/upload`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    console.log("Upload response:", uploadResponse);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload video: ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log("result", result);
    return {
      videoUrl: result.videoUrl,
      success: true,
    };
  } catch (error) {
    console.error("Error uploading video:", error);
    return {
      videoUrl: "",
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload video",
    };
  }
};

/* Example usage in your context:
import * as UserAPI from './userData';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userLogs, setUserLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const userData = await UserAPI.getCurrentUser();
        setUser(userData);
        if (userData?.id) {
          const logs = await UserAPI.getUserLogs(userData.id);
          setUserLogs(logs);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initUser();
  }, []);

  const updateUserData = async (userData: User) => {
    const updatedUser = await UserAPI.updateUser(userData);
    setUser(updatedUser);
    return updatedUser;
  };

  const refreshLogs = async () => {
    if (!user?.id) return;
    const logs = await UserAPI.getUserLogs(user.id);
    setUserLogs(logs);
    return logs;
  };

  const addNewLog = async (logData: Omit<ExerciseLog, 'id' | 'userId' | 'videoUrl'>) => {
    if (!user?.id) return;
    const newLog = await UserAPI.addUserLog(user.id, logData);
    setUserLogs(prev => [...prev, newLog]);
    return newLog;
  };

  const value = {
    user,
    userLogs,
    isLoading,
    updateUser: updateUserData,
    refreshLogs,
    addNewLog
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
*/
