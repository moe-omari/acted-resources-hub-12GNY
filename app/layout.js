import "./globals.css";
import { Suspense } from "react";
import Script from "next/script";
import AnalyticsPageTracker from "./AnalyticsPageTracker";
import { GA_MEASUREMENT_ID } from "../lib/analytics";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>
      </head>
      <body>
        <Suspense fallback={null}>
          <AnalyticsPageTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}