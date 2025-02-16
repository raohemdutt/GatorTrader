import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-primary">Welcome to Gator Marketplace</h1>
      <p className="text-xl text-gray-600">Trade, buy, and sell with your fellow Gators!</p>
      <div className="flex space-x-4">
        <Link href="/signup">
          <Button className="bg-primary text-white hover:bg-primary/90">Sign Up</Button>
        </Link>
        <Link href="/login">
          <Button className="bg-secondary text-white hover:bg-secondary/90">Log In</Button>
        </Link>
      </div>
    </div>
  )
}

