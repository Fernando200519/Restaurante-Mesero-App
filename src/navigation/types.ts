import { StackScreenProps } from '@react-navigation/stack';


export type RootStackParamList = {
  Login: undefined;
  HomeMesero: undefined; 
};



export type AppScreenProps<ScreenName extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, ScreenName>;