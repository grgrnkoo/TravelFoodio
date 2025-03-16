import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import UserProvider from "@/components/UserProvider";
import { PopUpProvider } from "@/components/providers/PopUpProvider";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { getUserByEmail } from "../../_lib/actions";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FoodSm.art | Your AI food helper",
  description: "Ultimate AI meal generation agent",
};

export default async function RootLayout({ children }) {
  const sessionPromise = getServerSession(authOptions);
  const session = await sessionPromise;
  const userProfilePromise = session?.user?.email ? getUserByEmail(session?.user?.email) : null;
  const userProfile = await userProfilePromise; // Fetch in parallel

  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-NFSYQN7KQE`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NFSYQN7KQE', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body
        className={``}
      >
        <SessionProviderWrapper>
          <UserProvider value={{ session, userProfile }}>
            <PopUpProvider>
              <Header />
              {children}
            </PopUpProvider>
          </UserProvider>
        </SessionProviderWrapper>
      </body>
    </html >
  );
}
