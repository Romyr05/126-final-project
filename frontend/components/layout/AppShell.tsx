"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type AppShellProps = {
  children: React.ReactNode;
};

const chromeHiddenRoutes = new Set(["/login", "/signup"]);

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideChrome = chromeHiddenRoutes.has(pathname);

  return (
    <>
      {hideChrome ? null : <Header />}
      {children}
      {hideChrome ? null : <Footer />}
    </>
  );
}
