"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import { OnSaveContext } from "@/context/OnSaveContext";

type UserDetail = {
  id?: number;
  name?: string;
  email?: string;
  credits?: number;
};

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState<UserDetail | undefined>();
  const [onSaveDate, setOnSaveDate] = useState<Date | null>(null);

  async function CreateNewUser() {
    try {
      const result = await axios.post<{ user: UserDetail }>("/api/users", {});
      console.log("API response:", result.data);
      setUserDetails(result.data.user);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("API call failed:", axiosError.response?.data || axiosError.message);
    }
  }

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      CreateNewUser();
    }
  }, [user]);

  return (
    <div>
      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <OnSaveContext.Provider value={{ onSaveDate, setOnSaveDate }}>
          {children}
        </OnSaveContext.Provider>
      </UserDetailContext.Provider>
    </div>
  );
};

export default Provider;