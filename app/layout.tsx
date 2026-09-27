import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Archivo, Inter } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['600', '700', '800', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ResQRoute — Emergency Highway Assistance',
  description:
    'Stranded on the highway? ResQRoute finds nearby mechanics, towing services, and emergency rental cars, and gives instant AI breakdown diagnosis and safety steps.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#d43324',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${archivo.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Script
          id="resqroute-theme"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              try {
                var theme = localStorage.getItem('resqroute-theme');
                var isDark = theme === 'dark';

                document.documentElement.classList.toggle(
                  'dark',
                  isDark
                );

                document.documentElement.style.colorScheme =
                  isDark ? 'dark' : 'light';
              } catch (e) {}
            })();
          `}
        </Script>

        {children}

        {process.env.NODE_ENV === 'production' && (
          <Analytics />
        )}
      </body>
    </html>
  )
}