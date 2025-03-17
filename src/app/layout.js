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
import Footer from "@/components/Footer";


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
  let session = null;
  let userProfile = null;

  try {
    session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userProfile = await getUserByEmail(session.user.email);
    }
  } catch (error) {
    console.error("Error fetching session or user:", error);
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-NFSYQN7KQE"
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
      <body className="min-h-full">
        <SessionProviderWrapper>
          <UserProvider value={{ session, userProfile }}>
            <PopUpProvider>
              <Header />
              {children}
              <Footer />
            </PopUpProvider>
          </UserProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
