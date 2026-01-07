import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { PopUpProvider } from "@/components/providers/PopUpProvider";
import Script from "next/script";
import Footer from "@/components/Footer";
import LocationProvider from "@/components/providers/LocationProvider";
import { fetchCountry } from "@lib/fetchCountry";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TravelFoodio | Your AI food helper",
  description: "Ultimate AI meal generation agent",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const countryData = await fetchCountry();
  const countryCode = countryData?.code || null;
  
  // Check auth cookie for Header
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
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
        <body className="min-h-full flex flex-col w-full justify-start items-center relative">
          <PopUpProvider>
            <LocationProvider location={countryCode}>
              <Header initialIsSignedIn={!!userId} />
              <div className="flex flex-1 w-full">
                {children}
              </div>
              <Footer />
            </LocationProvider>
          </PopUpProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
