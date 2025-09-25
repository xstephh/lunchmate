"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() =>
        start(async () => {
          await fetch(`/api/restaurants/${id}`, { method: "DELETE" });
          router.refresh();
        })
      }
      disabled={pending}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
