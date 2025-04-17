import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import FirebaseInitializer from '@/components/FirebaseInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BuddyBoard',
  description: 'Pet Service Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FirebaseInitializer />
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
