import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/app-data";

export default async function HomePage() {
  const { profile } = await getAppContext();
  redirect(profile.rol === "begeleider" ? "/begeleider/dashboard" : "/traject");
}
