"use client";

import { setAuth } from "@/components/auth/setAuth";

export default function Home() {
  setAuth();
  return (
    <main>
      <div>this is the home page</div>
    </main>
  );
}
