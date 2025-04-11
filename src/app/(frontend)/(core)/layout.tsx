import type React from 'react';
import NavBar from './NavBar';
import { NavBar2 } from './NavBar2';
import Footer from './Footer';

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*} <NavBar />*/}
      <NavBar2 />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
