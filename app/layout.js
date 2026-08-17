import "./globals.css";

export const metadata = {
  title: "Userlens — Let agents talk to your users",
  description:
    "AI agents that talk your users into adopting, buying, and loving your product more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=nippo@500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Doto:wght@500;700;900&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Sans:wght@500&family=Inter+Tight:wght@600&family=Inter:wght@500;600;700&family=Pixelify+Sans:wght@400;500;600&family=Sora:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
