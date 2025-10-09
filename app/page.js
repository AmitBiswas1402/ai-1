"use client"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"

const Home = () => {
  const {setTheme} = useTheme();
  return (
    <div>
      <Button onClick={() => setTheme('dark')}>Dark Mode</Button>
      <Button onClick={() => setTheme('light')}>Light Mode</Button>
    </div>
  )
}
export default Home