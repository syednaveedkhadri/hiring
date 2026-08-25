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
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                AI Rankings
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                AI-powered candidate evaluation and scoring by position
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {positions.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No positions found</p>
              </CardContent>
            </Card>
          ) : (
            positions.map((position) => (
              <Link key={position.id} href={`/rankings/${position.id}`} className="block group">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md shadow-slate-900/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:border-indigo-300 overflow-hidden">
                  {/* Header gradient bar */}
                  <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {position.title}
                          </h3>
                          {position.department && (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 border font-semibold">
                              {position.department}
                            </Badge>
                          )}
                          <Badge
                            className={
                              position.status === "OPEN"
                                ? "bg-green-100 text-green-700 border-green-200 border font-semibold"
                                : "bg-slate-100 text-slate-600 border-slate-200 border font-semibold"
                            }
                          >
                            {position.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Total Candidates
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-3xl font-bold text-slate-900">
                                {position._count.candidates}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Evaluated
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <Award className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="text-3xl font-bold text-slate-900">
                                {position.evaluatedCount}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Vacancies
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                              {position.vacancies}
                            </div>
                          </div>

                          {position.topScore !== null && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Top Score
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="text-3xl font-bold text-green-600">
                                  {position.topScore}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {position.topCandidate && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-sm">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              <span className="text-slate-600">Top candidate:</span>
                              <span className="font-semibold text-slate-900">{position.topCandidate.fullName}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors ml-6 flex-shrink-0" />
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
