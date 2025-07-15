import type { Metadata } from "next";
import { SignedIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "HazyFlow - Dashboard",
  description: "A flow-based AI application builder",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
    </>
  );
}
