import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen bg-gradient-to-b from-[#3A2929] to-[#211717]">
      <div>{children}</div>
    </main>
  );
}
