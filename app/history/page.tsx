import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CUISINE_LABELS } from "@/lib/cuisine";

const CuisineDistribution = dynamic(
  () => import("@/components/charts/CuisineDistribution.client").then((m) => m.CuisineDistribution),
  { ssr: false },
);
const RatingsByCuisine = dynamic(
  () => import("@/components/charts/RatingsByCuisine.client").then((m) => m.RatingsByCuisine),
  { ssr: false },
);

async function getHistoryData() {
  const visits = await prisma.visit.findMany({
    orderBy: { createdAt: "desc" },
    include: { restaurant: true },
    take: 50,
  });

  // Cuisine distribution by visited restaurants
  const byCuisine = new Map<string, number>();
  for (const v of visits) {
    const key = v.restaurant?.cuisine || "other";
    byCuisine.set(key, (byCuisine.get(key) ?? 0) + 1);
  }
  const pie = Array.from(byCuisine.entries()).map(([k, v]) => ({
    name: CUISINE_LABELS[k as keyof typeof CUISINE_LABELS] || k,
    value: v,
  }));

  // Average rating by cuisine
  const ratingAgg = new Map<string, { sum: number; count: number }>();
  for (const v of visits) {
    const key = v.restaurant?.cuisine || "other";
    const entry = ratingAgg.get(key) ?? { sum: 0, count: 0 };
    entry.sum += v.rating;
    entry.count += 1;
    ratingAgg.set(key, entry);
  }
  const bars = Array.from(ratingAgg.entries()).map(([k, { sum, count }]) => ({
    name: CUISINE_LABELS[k as keyof typeof CUISINE_LABELS] || k,
    avg: count ? Math.round((sum / count) * 10) / 10 : 0,
  }));

  return { visits, pie, bars };
}

export default async function HistoryPage() {
  const { visits, pie, bars } = await getHistoryData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent visits</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No visits yet. (Logging arrives in Phase 5.)
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Restaurant</th>
                    <th className="py-2 pr-4">Cuisine</th>
                    <th className="py-2 pr-4">Rating</th>
                    <th className="py-2 pr-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="py-2 pr-4">{new Date(v.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">{v.restaurant?.name ?? "—"}</td>
                      <td className="py-2 pr-4 capitalize">{v.restaurant?.cuisine ?? "—"}</td>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cuisine distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CuisineDistribution data={pie} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average rating by cuisine</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingsByCuisine data={bars} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
