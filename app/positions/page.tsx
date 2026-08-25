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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Open Positions
            </h1>
            <p className="text-slate-600 text-lg">
              Manage active recruitment campaigns and hiring requirements
            </p>
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-11 px-6">
            <Plus className="h-4 w-4 mr-2" />
            New Position
          </Button>
        </div>

        {/* Position Cards Grid */}
        {positions.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-slate-600 text-lg font-medium">No positions found</p>
              <p className="text-slate-500 text-sm mt-2">
                Click &quot;New Position&quot; to create your first hiring position
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
