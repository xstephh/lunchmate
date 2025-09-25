// app/suggest/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuggestClient from "./suggest.client";

export default async function SuggestPage({
  searchParams,
}: {
  searchParams: { mode?: string; cuisine?: string };
}) {
  const mode = (searchParams?.mode as string) || "familiar";
  const cuisine = (searchParams?.cuisine as string) || "any";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today’s pick</CardTitle>
        </CardHeader>
        <CardContent>
          <SuggestClient mode={mode} cuisine={cuisine} />
        </CardContent>
      </Card>
    </div>
  );
}
