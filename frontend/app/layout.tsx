import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NuGenova Payroll Intelligence | Varun Sharma",
  description: "Executive payroll intelligence and timesheet calculation portal for Varun Sharma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 font-sans">{children}</body>
    </html>
  );
}
