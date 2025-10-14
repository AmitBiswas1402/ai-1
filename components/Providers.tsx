"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "./ui/sidebar";
import AppHeader from "@/app/_components/AppHeader";
import { AppSidebar } from "@/app/_components/AppSidebar";
import {
  AISelectedModelContext,
  AIModelsType,
} from "@/context/AISelectedModels";
import { DefaultModel } from "@/shared/AIModelsShared";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import { db } from "@/config/FirebaseDB";
import { useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { UserDetailsContext } from "@/context/UserDetailContext";

interface ThemeProviderProps
  extends React.ComponentProps<typeof NextThemesProvider> {}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [aiSelectedModels, setAiSelectedModels] =
    React.useState<AIModelsType>(DefaultModel);
  const { user, isLoaded } = useUser();
  const [userDetails, setUserDetails] = React.useState<DocumentData | any>();
  const [messages, setMessages] = React.useState({});

  React.useEffect(() => {
    if (isLoaded && user) {
      saveUserToFirestore(user);
    }
  }, [user, isLoaded]);

  // Helper function to save user to Firestore
  const saveUserToFirestore = async (user: UserResource) => {
    try {
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("👤 User already exists in Firestore");
        const userInfo = userSnap.data();
        if (userInfo?.selectedModelPref) {
          setAiSelectedModels(userInfo.selectedModelPref);
        }
        setUserDetails(userInfo);
        return;
      }

      const userData = {
        name: user.fullName,
        email: email,
        selectedModelPref: DefaultModel,
        createdAt: new Date(),
      };

      await setDoc(userRef, userData);
      console.log("New user saved to Firestore");
      setUserDetails(userData);
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
        <AISelectedModelContext.Provider
          value={{
            aiSelectedModels,
            setAiSelectedModels,
            messages,
            setMessages,
          }}
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full">
              <AppHeader />
              {children}
            </div>
          </SidebarProvider>
        </AISelectedModelContext.Provider>
      </UserDetailsContext.Provider>
    </NextThemesProvider>
  );
}
