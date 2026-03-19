import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("campusx_token")

  if (token) {
    redirect("/feed")
  } else {
    redirect("/login")
  }
}
