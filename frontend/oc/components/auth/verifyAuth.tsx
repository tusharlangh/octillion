"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function verifyAuth() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.replace("/");
    }
  }, []);

  return null;
}
