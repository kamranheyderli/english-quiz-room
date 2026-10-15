import type { Metadata } from "next";
import { Bricolage_Grotesque, Lexend } from "next/font/google";
import AppShell from "@/components/AppShell";
import Provider from "@/components/ui/provider";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], weight: ["600", "800"], variable: "--font-display" });
const body = Lexend({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "English Quiz Room",
  description: "Yaş qruplarına və CEFR səviyyələrinə görə ingilis dili testləri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <Provider>
          <AppShell>{children}</AppShell>
        </Provider>
      </body>
    </html>
  );
}
