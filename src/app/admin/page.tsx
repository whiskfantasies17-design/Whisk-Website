"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/owner");
  }, [router]);

  return (
    <div className="min-h-screen bg-primary text-white flex items-center justify-center font-sans">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-white/60">Redirecting to Owner Portal (/owner)...</p>
      </div>
    </div>
  );
}
