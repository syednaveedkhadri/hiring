import { Button } from "@/components/ui/button";
import { PositionCard } from "@/components/positions/position-card";
import prisma from "@/lib/db/prisma";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPositions() {
  const positions = await prisma.position.findMany({
    include: {
      _count: {
        select: {
          candidates: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return positions;
}

export default async function PositionsPage() {
  const positions = await getPositions();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
              <p className="text-muted-foreground mt-2">
                Manage hiring positions and recruitment requirements
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4" />
              Add Position
            </Button>
          </div>
        </div>

        {/* Position Cards Grid */}
        {positions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No positions found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Click &quot;Add Position&quot; to create your first position
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                id={position.id}
                title={position.title}
                department={position.department}
                vacancies={position.vacancies}
                seniorityLevel={position.seniorityLevel}
                status={position.status}
                candidateCount={position._count.candidates}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
