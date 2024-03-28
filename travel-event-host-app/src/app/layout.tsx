import { MuiThemeProvider } from '@/providers/muiThemeProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { Roboto_Flex } from 'next/font/google';

import { Header } from '@/components/header/Header';

import { Footer } from '@/components/footer/Footer';
import { AppProvider } from '@/lib/app-context';
import { AuthenticationSessionProvider } from '@/lib/auth-context';
import { NextAuthProvider } from '@/providers/nextAuthProvider';
import { Metadata } from 'next';
import './globals.css';

const roboto = Roboto_Flex({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bakpak',
  description: 'Social. Adventure. Travel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className='scrollbar1' lang='en'>
      <body className={roboto.className}>
        <NextAuthProvider>
          <AuthenticationSessionProvider>
            <AppRouterCacheProvider>
              <MuiThemeProvider>
                <AppProvider>
                  <Header />
                  {children}
                  <Footer />
                </AppProvider>
              </MuiThemeProvider>
            </AppRouterCacheProvider>
          </AuthenticationSessionProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
