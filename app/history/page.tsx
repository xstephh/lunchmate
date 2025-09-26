// app/history/page.tsx
export const dynamic = "force-dynamic"; // don't SSG this page
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";

async function getHistoryData() {
  try {
    const visits = await prisma.visit.findMany({
      orderBy: { createdAt: "desc" },
      include: { restaurant: true },
      take: 50,
    });
    return visits;
  } catch (err: any) {
    // If the local SQLite file exists but is empty (no tables), Prisma throws P2021.
    // Return empty history so the page renders instead of failing the build.
    if (err?.code === "P2021") return [];
    throw err;
  }
}

export default async function HistoryPage() {
  const visits = await getHistoryData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My visit history</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <EmptyState title="No visits yet">
              Add a visit from a suggestion card or the manage page.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Restaurant</th>
                    <th className="py-2 pr-4">Rating</th>
                    <th className="py-2 pr-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="py-2 pr-4">{new Date(v.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">{v.restaurant?.name ?? "—"}</td>
                      <td className="py-2 pr-4">{v.rating}</td>
                      <td className="py-2 pr-4">{v.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
