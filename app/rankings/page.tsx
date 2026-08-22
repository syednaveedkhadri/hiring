import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, ChevronRight, Award } from "lucide-react";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function getPositionsWithRankings() {
  const positions = await prisma.position.findMany({
    include: {
      _count: {
        select: {
          candidates: true,
        },
      },
      aiEvaluations: {
        orderBy: {
          overallScore: "desc",
        },
        take: 1,
        include: {
          candidate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get count of evaluated candidates per position
  const positionsWithStats = await Promise.all(
    positions.map(async (position) => {
      const evaluatedCount = await prisma.aIEvaluation.groupBy({
        by: ["candidateId"],
        where: {
          positionId: position.id,
        },
      });

      return {
        ...position,
        evaluatedCount: evaluatedCount.length,
        topScore: position.aiEvaluations[0]?.overallScore || null,
        topCandidate: position.aiEvaluations[0]?.candidate || null,
      };
    })
  );

  return positionsWithStats;
}

export default async function RankingsPage() {
  const positions = await getPositionsWithRankings();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            Candidate Rankings
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered candidate evaluation and ranking by position
          </p>
        </div>

        <div className="grid gap-4">
          {positions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No positions found</p>
              </CardContent>
            </Card>
          ) : (
            positions.map((position) => (
              <Link key={position.id} href={`/rankings/${position.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{position.title}</h3>
                          {position.department && (
                            <Badge variant="outline">{position.department}</Badge>
                          )}
                          <Badge
                            variant={
                              position.status === "OPEN" ? "default" : "secondary"
                            }
                          >
                            {position.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Total Candidates
                            </div>
                            <div className="text-2xl font-bold flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {position._count.candidates}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">
                              Evaluated
                            </div>
                            <div className="text-2xl font-bold flex items-center gap-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              {position.evaluatedCount}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground">
                              Vacancies
                            </div>
                            <div className="text-2xl font-bold">
                              {position.vacancies}
                            </div>
                          </div>

                          {position.topScore !== null && (
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Top Score
                              </div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {position.topScore}
                              </div>
                            </div>
                          )}
                        </div>

                        {position.topCandidate && (
                          <div className="mt-3 text-sm text-muted-foreground">
                            Top candidate: <span className="font-medium text-foreground">{position.topCandidate.fullName}</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
