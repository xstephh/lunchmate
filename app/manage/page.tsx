// app/manage/page.tsx
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddRestaurantForm } from "@/components/forms/AddRestaurantForm";
import { ImportForm } from "@/components/forms/ImportForm";
import { EmptyState } from "@/components/common/EmptyState";
import DeleteButton from "./DeleteButton.client";

async function getRestaurants() {
  return prisma.restaurant.findMany({
    where: { source: "manual" as any },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ManagePage() {
  const restaurants = await getRestaurants();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import my places</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a manual restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <AddRestaurantForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My list (manual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {restaurants.length === 0 ? (
            <EmptyState title="No restaurants yet">
              Import CSV/JSON or use the form above to add your first place.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Cuisine</th>
                    <th className="py-2 pr-4">Address</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4 capitalize">{r.cuisine}</td>
                      <td className="py-2 pr-4">{r.address}</td>
                      <td className="py-2 pr-4">{r.priceLevel ?? "-"}</td>
                      <td className="py-2 pr-4">
                        <DeleteButton id={r.id} />
                      </td>
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
