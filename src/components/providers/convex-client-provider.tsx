"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => {
    return new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");
  }, [convexUrl]);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
