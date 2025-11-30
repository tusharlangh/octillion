"use client";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modalRoot = document.getElementById("modal-root");
  return modalRoot ? ReactDOM.createPortal(children, modalRoot) : null;
}
