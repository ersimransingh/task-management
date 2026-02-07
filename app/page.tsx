import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const company = await prisma.company.findFirst();

  if (!company) {
    redirect("/setup");
  }

  // If company exists, but no session, redirect to login (not implemented yet)
  // For now, redirect to dashboard which we will protect or mock
  redirect("/dashboard");
}

