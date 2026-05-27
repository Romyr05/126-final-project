import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-sans">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
