"use client"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"
import ChatInputBox from "./_components/ChatInputBox";

const Home = () => {
  const {setTheme} = useTheme();
  return (
    <div>
      <ChatInputBox />
    </div>
  )
}
export default Home