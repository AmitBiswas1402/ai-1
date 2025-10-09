"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "@/app/_components/AppSidebar";

export function ThemeProvider({ children, ...props }) {
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
        <SidebarTrigger />
        <div>{children}</div>
      </SidebarProvider>
    </NextThemesProvider>
  );
}
