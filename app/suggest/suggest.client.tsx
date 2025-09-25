"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SuggestClient() {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        // force a reroll by refreshing (new random on server)
        router.refresh();
      }}
    >
      Reroll
    </Button>
  );
}
