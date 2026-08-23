import React, { Suspense } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { CartDrawer } from "@/components/shared/CartDrawer";
import { Footer } from "@/components/shared/Footer";
import { Chatbot } from "@/components/customer/Chatbot";
import { OfferBanner } from "@/components/customer/OfferBanner";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <OfferBanner />
      <Suspense fallback={<div className="h-20 bg-background border-b border-primary/5" />}>
        <Navbar />
      </Suspense>
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
}
