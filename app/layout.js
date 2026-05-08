import './globals.css';

export const metadata = {
  title: 'WindowSurf.tv — Live Windows From Around the World',
  description: 'Curated live streams from beaches, cities, airports, wildlife, space, and more. Turn any screen into somewhere else.',
  keywords: 'live cam, live stream, webcam, beach cam, city cam, wildlife cam, airport cam, space cam, ambient, background',
  openGraph: {
    title: 'WindowSurf.tv',
    description: 'Turn any screen into somewhere else. Curated live streams from around the world.',
    url: 'https://windowsurf.tv',
    siteName: 'WindowSurf.tv',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WindowSurf.tv',
    description: 'Turn any screen into somewhere else.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow+Condensed:wght@600;700;800;900&family=Permanent+Marker&family=Barlow:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body>{children}</body>
    </html>
  );
}
