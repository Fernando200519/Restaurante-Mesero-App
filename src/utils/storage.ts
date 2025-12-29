import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const storage = {
  saveTokens: async (access: string, refresh: string) => {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, access],
      [REFRESH_TOKEN_KEY, refresh],
    ]);
  },
  getAccessToken: async () => await AsyncStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: async () => await AsyncStorage.getItem(REFRESH_TOKEN_KEY),

  removeTokens: async () => {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};
