import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen">
      <div>{children}</div>
    </main>
  );
}
