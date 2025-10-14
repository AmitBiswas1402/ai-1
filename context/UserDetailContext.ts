import { createContext, Dispatch, SetStateAction } from "react";

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface UserDetailsContextType {
  userDetails: UserDetails | null;
  setUserDetails: Dispatch<SetStateAction<UserDetails | null>>;
}

export const UserDetailsContext = createContext<
  UserDetailsContextType | undefined
>(undefined);
