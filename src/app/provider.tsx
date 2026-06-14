"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { UserDetailContext } from "@/context/UserDetailContext";
import { OnSaveContext, type DesignHtmlGetter } from "@/context/OnSaveContext";

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
  const { isLoaded, user } = useUser();
  const [userDetails, setUserDetails] = useState<UserDetail | undefined>();
  const [onSaveDate, setOnSaveDate] = useState<Date | null>(null);
  const designHtmlGetterRef = useRef<DesignHtmlGetter | null>(null);

  const setDesignHtmlGetter = (getter: DesignHtmlGetter | null) => {
    designHtmlGetterRef.current = getter;
  };

  const getDesignHtml = () => designHtmlGetterRef.current?.() ?? null;

  useEffect(() => {
    user && CreateUser();
    // if (!isLoaded) {
    //   return;
    // }

    // if (!user) {
    //   setUserDetails(undefined);
    //   return;
    // }

    // const syncUser = async () => {
    //   try {
    //     const result = await axios.post<{ user: UserDetail }>("/api/users");
    //     setUserDetails(result.data.user);
    //   } catch (error) {
    //     console.error("Failed to sync user:", error);
    //   }
    // };

    // void syncUser();
  // }, [isLoaded, user?.id]);
  }, [user]);
  
  const CreateUser = async () => {
    const result = await axios.post('/api/users', {
            
    });
    // console.log(result.data);
    setUserDetails(result.data?.user);
  }

  return (
    <>
      <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
        <OnSaveContext.Provider
          value={{ onSaveDate, setOnSaveDate, setDesignHtmlGetter, getDesignHtml }}
        >
          {children}
        </OnSaveContext.Provider>
      </UserDetailContext.Provider>
    </>
  );
};

export default Provider;
