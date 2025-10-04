import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen bg-gradient-to-b from-[#634a4a] via-[#2e2121] to-[#211717] ">
      <div>{children}</div>
    </main>
  );
}
