"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "@/app/_components/AppSidebar";
import AppHeader from "@/app/_components/AppHeader";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirebaseDB";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function ThemeProvider({ children, ...props }) {
  const { user, isLoaded } = useUser();

  React.useEffect(() => {
    if (isLoaded && user) {
      saveUserToFirestore(user); // Call our helper
    }
  }, [user, isLoaded]);

  // Helper function to save user to Firestore
  const saveUserToFirestore = async (user) => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return; // safety check

      const userRef = doc(db, "users", user.id); // Clerk ID as doc ID
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("👤 User already exists in Firestore");
        return;
      }

      const userData = {
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress || "",
        // profileImage: user.profileImageUrl
        //   ? `${user.profileImageUrl}?width=32&height=32`
        //   : "/default-avatar.png",
        createdAt: new Date(),
      };

      await setDoc(userRef, userData);
      console.log("✅ New user saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving user to Firestore:", error);
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
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </NextThemesProvider>
  );
}
