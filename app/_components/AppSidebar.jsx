"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Ghost, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={"/logo.svg"}
                alt="logo"
                width={55}
                height={55}
                className="w-[40px] h-[40px]"
              />
              <h2 className="font-bold text-xl">All AI</h2>
            </div>
            <div className="">
              {theme == "light" ? (
                <Button onClick={() => setTheme("dark")} variant={Ghost}>
                  <Sun />
                </Button>
              ) : (
                <Button
                  onClick={() => setTheme("light")}
                  variant={Ghost}
                  className="cursor-pointer"
                >
                  <Moon />
                </Button>
              )}
            </div>
          </div>
          <Button className="mt-7 w-full" size="lg">
            {" "}
            + New Chat
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chats</h2>
            <p className="text-sm text-gray-400">Sign In to chat with All AI</p>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 mb-5">
          <Button className={"w-full"} size={"lg"}>
            Sign In / Sign Up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
