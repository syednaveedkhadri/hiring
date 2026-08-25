import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { RankBadge } from "@/components/ui/rank-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Briefcase,
  TrendingUp,
  Sparkles,
  UserPlus,
  Search,
  Calendar,
  Star,
  ChevronRight,
  Plus,
  BrainCircuit,
  MessageSquare,
  Trophy,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const totalPositions = await prisma.position.count();
  const totalCandidates = await prisma.candidate.count();

  const evaluatedCandidates = await prisma.candidate.count({
    where: { aiEvaluations: { some: {} } },
  });

  const statusCounts = await prisma.candidate.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  const topCandidates = await prisma.candidateRanking.findMany({
    where: { rank: { lte: 3 } },
    include: {
      candidate: {
        include: {
          position: true,
          photo: true,
        },
      },
      evaluation: true,
    },
    orderBy: [
      { positionId: "asc" },
      { rank: "asc" },
    ],
    take: 3,
  });

  const notEvaluatedCandidates = await prisma.candidate.findMany({
    where: { aiEvaluations: { none: {} } },
    include: {
      position: true,
      photo: true,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const recentInterviews = await prisma.interview.findMany({
    where: { status: "COMPLETED" },
    include: {
      candidate: {
        include: {
          position: true,
          photo: true,
        },
      },
      scores: true,
    },
    orderBy: { interviewDate: "desc" },
    take: 2,
  });

  const positions = await prisma.position.findMany({
    include: {
      candidates: {
        include: { aiEvaluations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const positionProgress = positions.map((position) => {
    const totalCandidates = position.candidates.length;
    const evaluatedCount = position.candidates.filter((c) => c.aiEvaluations.length > 0).length;
    const shortlistedCount = position.candidates.filter((c) => c.status === "SHORTLISTED").length;
    const selectedCount = position.candidates.filter((c) => c.status === "SELECTED").length;

    return {
      id: position.id,
      title: position.title,
      totalCandidates,
      evaluatedCount,
      shortlistedCount,
      selectedCount,
    };
  }).slice(0, 4);

  // Calculate avg interview score
  const allScores = recentInterviews.flatMap(i => i.scores);
  const avgInterviewScore = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length
    : 0;

  // Find best match
  const bestMatch = topCandidates.length > 0 ? topCandidates[0] : null;

  // Find most active position
  const mostActivePosition = positionProgress.length > 0
    ? positionProgress.reduce((max, p) => p.totalCandidates > max.totalCandidates ? p : max, positionProgress[0])
    : null;

  return {
    totalPositions,
    totalCandidates,
    evaluatedCandidates,
    statusMap,
    topCandidates,
    notEvaluatedCandidates,
    recentInterviews,
    positionProgress,
    avgInterviewScore,
    bestMatch,
    mostActivePosition,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const pendingEvaluation = data.totalCandidates - data.evaluatedCandidates;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Hero Section */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-indigo-600 font-medium mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back!
            </p>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              AI Hiring Intelligence
              <span className="text-3xl">✨</span>
            </h1>
            <p className="text-lg text-slate-600">
              Let AI handle the analysis. You make the hiring decision.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30">
              <Link href="/positions/new">
                <Plus className="h-4 w-4 mr-2" />
                New Position
              </Link>
            </Button>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-4 gap-6">
          {/* Open Positions */}
          <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                  <Briefcase className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Open Positions</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">{data.totalPositions}</p>
              <p className="text-xs text-slate-500">Active hiring roles</p>
            </CardContent>
          </Card>

          {/* Total Candidates */}
          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
                  <Users className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Candidates</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">{data.totalCandidates}</p>
              <p className="text-xs text-slate-500">In recruitment pipeline</p>
            </CardContent>
          </Card>

          {/* AI Evaluated */}
          <Card className="border-purple-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 inline-block mb-3">
                    <BrainCircuit className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">AI Evaluated</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{data.evaluatedCandidates}</p>
                  <p className="text-xs text-slate-500">{Math.round((data.evaluatedCandidates / Math.max(data.totalCandidates, 1)) * 100)}% coverage</p>
                </div>
                <CircularProgress
                  value={data.evaluatedCandidates}
                  max={data.totalCandidates}
                  size={70}
                  strokeWidth={6}
                  variant="ai"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Shortlisted</p>
              <p className="text-4xl font-bold text-slate-900 mb-1">{data.statusMap["SHORTLISTED"] || 0}</p>
              <p className="text-xs text-slate-500">Strong candidates</p>
            </CardContent>
          </Card>
        </div>

        {/* Candidate Pipeline */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="grid grid-cols-7 gap-3">
              {[
                { status: "NEW", icon: UserPlus, color: "indigo", label: "NEW" },
                { status: "SCREENING", icon: Search, color: "blue", label: "SCREENING" },
                { status: "INTERVIEWED", icon: Calendar, color: "blue", label: "INTERVIEWED" },
                { status: "SHORTLISTED", icon: Star, color: "emerald", label: "SHORTLISTED" },
                { status: "SELECTED", icon: CheckCircle, color: "emerald", label: "SELECTED" },
                { status: "REJECTED", icon: XCircle, color: "red", label: "REJECTED" },
                { status: "ON_HOLD", icon: Clock, color: "amber", label: "ON HOLD" },
              ].map((stage, idx) => {
                const Icon = stage.icon;
                const count = data.statusMap[stage.status] || 0;
                return (
                  <div key={stage.status} className="relative">
                    <div className="text-center">
                      <div className={`mx-auto mb-3 h-14 w-14 rounded-full bg-gradient-to-br from-${stage.color}-100 to-${stage.color}-200 flex items-center justify-center border-2 border-${stage.color}-300`}>
                        <Icon className={`h-6 w-6 text-${stage.color}-600`} strokeWidth={2} />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{count}</p>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stage.label}</p>
                    </div>
                    {idx < 6 && (
                      <ArrowRight className="absolute top-6 -right-5 h-5 w-5 text-slate-300 z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Grid - 3 Columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Top Candidates */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Top Candidates by Position</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                <Link href="/rankings">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topCandidates.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No ranked candidates yet</p>
              ) : (
                data.topCandidates.map((ranking) => (
                  <Link
                    key={ranking.id}
                    href={`/candidates/${ranking.candidateId}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                  >
                    <RankBadge rank={ranking.rank} size="md" />
                    <Avatar className="h-10 w-10">
                      {ranking.candidate.photo?.fileUrl ? (
                        <AvatarImage src={ranking.candidate.photo.fileUrl} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                        {ranking.candidate.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{ranking.candidate.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{ranking.candidate.position.title}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-5">
                        {ranking.evaluation.recommendation.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="text-center">
                        <p className="text-sm font-bold text-emerald-600">{Math.round(ranking.evaluation.overallScore)}%</p>
                        <p className="text-[10px] text-slate-500">AI Match</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= Math.floor(ranking.evaluation.overallScore / 20) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Candidates Not Yet Evaluated */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Candidates Not Yet Evaluated
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                <Link href="/candidates">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.notEvaluatedCandidates.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">All candidates evaluated</p>
              ) : (
                data.notEvaluatedCandidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all bg-white"
                  >
                    <Avatar className="h-10 w-10">
                      {candidate.photo?.fileUrl ? (
                        <AvatarImage src={candidate.photo.fileUrl} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                        {candidate.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{candidate.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{candidate.position.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200">
                        {candidate.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-purple-600">
                        <Sparkles className="h-3 w-3" />
                        <span>Awaiting AI Evaluation</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* AI Evaluation Coverage */}
          <Card className="bg-gradient-to-br from-white to-indigo-50/30 backdrop-blur-sm shadow-sm border-indigo-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-600" />
                AI Evaluation Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                <CircularProgress
                  value={data.evaluatedCandidates}
                  max={data.totalCandidates}
                  size={140}
                  strokeWidth={10}
                  variant="ai"
                />
                <div className="grid grid-cols-3 gap-6 mt-8 w-full">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{data.evaluatedCandidates}</p>
                    <p className="text-xs text-slate-500">Evaluated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{pendingEvaluation}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{data.totalCandidates}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
                <div className="mt-6 p-3 rounded-xl bg-indigo-50 border border-indigo-100 w-full">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-900 mb-0.5">Keep going!</p>
                      <p className="text-xs text-indigo-700">
                        {pendingEvaluation === 0
                          ? "All current candidates have been evaluated."
                          : `${pendingEvaluation} candidate${pendingEvaluation > 1 ? 's are' : ' is'} waiting for AI evaluation.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - 3 Columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Interviews */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Interviews</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                <Link href="/candidates">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentInterviews.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No interviews yet</p>
              ) : (
                data.recentInterviews.map((interview) => {
                  const avgScore = interview.scores.length > 0
                    ? interview.scores.reduce((sum, s) => sum + s.score, 0) / interview.scores.length
                    : 0;
                  const scoreColor = avgScore >= 8 ? "emerald" : avgScore >= 6 ? "blue" : avgScore >= 4 ? "amber" : "red";

                  return (
                    <Link
                      key={interview.id}
                      href={`/candidates/${interview.candidateId}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                    >
                      <Avatar className="h-10 w-10">
                        {interview.candidate.photo?.fileUrl ? (
                          <AvatarImage src={interview.candidate.photo.fileUrl} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                          {interview.candidate.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{interview.candidate.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{interview.candidate.position.title} • {interview.interviewType}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-2 py-1 rounded-full bg-${scoreColor}-50 border border-${scoreColor}-200 text-${scoreColor}-700 text-xs font-semibold`}>
                          {avgScore.toFixed(1)}/10
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {new Date(interview.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Position Hiring Progress */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Position Hiring Progress</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                <Link href="/positions">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.positionProgress.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No positions yet</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-6 gap-2 pb-2 border-b text-xs font-semibold text-slate-600">
                    <div className="col-span-2">Position</div>
                    <div className="text-center">Total</div>
                    <div className="text-center">Eval.</div>
                    <div className="text-center">Short.</div>
                    <div>Progress</div>
                  </div>
                  {data.positionProgress.map((position) => {
                    const progress = position.totalCandidates > 0
                      ? (position.evaluatedCount / position.totalCandidates) * 100
                      : 0;

                    return (
                      <div key={position.id} className="grid grid-cols-6 gap-2 items-center text-sm">
                        <div className="col-span-2 font-medium text-slate-900 truncate">{position.title}</div>
                        <div className="text-center text-slate-600">{position.totalCandidates}</div>
                        <div className="text-center text-slate-600">{position.evaluatedCount}</div>
                        <div className="text-center text-slate-600">{position.shortlistedCount}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/positions/new"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white group"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                  <Plus className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">Add New Position</p>
                  <p className="text-xs text-slate-500">Create a new hiring position</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <Link
                href="/candidates/new"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-cyan-100 transition-colors">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">Add Candidate</p>
                  <p className="text-xs text-slate-500">Manually add a candidate</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/candidates"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all bg-white group"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center group-hover:from-purple-100 group-hover:to-indigo-100 transition-colors">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">AI Interview Assistant</p>
                  <p className="text-xs text-slate-500">Generate interview questions</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600" />
              </Link>

              <Link
                href="/rankings"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all bg-white group"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center group-hover:from-emerald-100 group-hover:to-green-100 transition-colors">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">View Rankings</p>
                  <p className="text-xs text-slate-500">See all candidate rankings</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Insight Strip */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <BrainCircuit className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-900 mb-0.5">AI Insight</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {pendingEvaluation === 0 ? "All evaluated!" : `${pendingEvaluation} pending`}
                  </p>
                  <p className="text-xs text-indigo-600">
                    {pendingEvaluation === 0
                      ? "Complete evaluations"
                      : `candidate${pendingEvaluation > 1 ? 's' : ''} waiting`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-900 mb-0.5">Best Match</p>
                  {data.bestMatch ? (
                    <>
                      <p className="text-lg font-bold text-emerald-700">{Math.round(data.bestMatch.evaluation.overallScore)}%</p>
                      <p className="text-xs text-emerald-600 truncate">{data.bestMatch.candidate.fullName}</p>
                    </>
                  ) : (
                    <p className="text-sm text-emerald-600">No rankings yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-900 mb-0.5">Most Active Position</p>
                  {data.mostActivePosition ? (
                    <>
                      <p className="text-lg font-bold text-blue-700">{data.mostActivePosition.totalCandidates}</p>
                      <p className="text-xs text-blue-600 truncate">{data.mostActivePosition.title}</p>
                    </>
                  ) : (
                    <p className="text-sm text-blue-600">No positions yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-900 mb-0.5">Avg. Interview Score</p>
                  <p className="text-lg font-bold text-amber-700">
                    {data.recentInterviews.length > 0
                      ? `${data.avgInterviewScore.toFixed(1)}/10`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-amber-600">
                    {data.recentInterviews.length > 0
                      ? `Across ${data.recentInterviews.length} interview${data.recentInterviews.length > 1 ? 's' : ''}`
                      : "No interviews yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
