import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import localFont from 'next/font/local'
import Script from 'next/script'

import Footer from "@/components/footer";

import "./global.css";

const jetbrainsMono = localFont({
  src: [
    {
      path: './fonts/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/JetBrainsMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/JetBrainsMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/JetBrainsMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-jetbrains-mono'
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} font-mono`}>
      <body className="min-h-screen flex flex-col p-4 md:p-8 bg-white">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <PrismicPreview repositoryName={repositoryName} />
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KWT373PM1N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KWT373PM1N');
          `}
        </Script>
      </body>
    </html>
  );
}
