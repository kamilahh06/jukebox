// import React from "react"
// import type { Metadata, Viewport } from "next";
// import { Orbitron, Space_Mono } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "sonner";
// import { AuroraBackground } from "@/components/aurora-background";

// const orbitron = Orbitron({
//   subsets: ["latin"],
//   variable: "--font-orbitron",
//   weight: ["400", "500", "600", "700", "800", "900"],
// });

// const spaceMono = Space_Mono({
//   subsets: ["latin"],
//   weight: ["400", "700"],
//   variable: "--font-space-mono",
// });

// export const metadata: Metadata = {
//   title: "Jukebox - Social Music Platform",
//   description:
//     "Rate, review, and discuss music with line-by-line annotations, playlists, and community insights.",
// };

// export const viewport: Viewport = {
//   themeColor: "#08091A",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className={`dark ${orbitron.variable} ${spaceMono.variable}`}>
//       <body className="font-sans antialiased min-h-screen" suppressHydrationWarning>
//         <AuroraBackground />

//         <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
//           <div className="pointer-events-auto flex flex-col min-h-screen flex-1">
//             {/* ❌ Navbar REMOVED — TopMenu is now the only menu */}
//             <main className="flex-1">{children}</main>
//           </div>
//         </div>

//         <Toaster
//           theme="dark"
//           toastOptions={{
//             style: {
//               background: "hsl(230 25% 7%)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "hsl(220 60% 95%)",
//             },
//           }}
//         />
//       </body>
//     </html>
//   );
// }
import React from "react";
import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuroraBackground } from "@/components/aurora-background";
import { TopMenu } from "@/components/home/TopMenu";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Jukebox - Social Music Platform",
  description:
    "Rate, review, and discuss music with line-by-line annotations, playlists, and community insights.",
};

export const viewport: Viewport = {
  themeColor: "#08091A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased min-h-screen" suppressHydrationWarning>
        <AuroraBackground />

        <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
          <div className="pointer-events-auto flex flex-col min-h-screen flex-1">
            <TopMenu />
            <main className="flex-1">{children}</main>
          </div>
        </div>

        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(230 25% 7%)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "hsl(220 60% 95%)",
            },
          }}
        />
      </body>
    </html>
  );
}