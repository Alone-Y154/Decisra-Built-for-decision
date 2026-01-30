"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function isLiveSessionPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/session\/[^/]+\/live\/?$/.test(pathname);
}

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = isLiveSessionPath(pathname);

  return (
    <>
      {!hideChrome && <Header />}
      <main className={hideChrome ? "" : "pt-16"}>{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
