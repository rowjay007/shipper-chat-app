"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GalleryPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/chat");
  }, [router]);

  return null;
}

