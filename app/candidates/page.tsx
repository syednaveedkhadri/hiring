import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QuickStatusControl } from "@/components/candidates/quick-status-control";
import prisma from "@/lib/db/prisma";
import { Plus, MapPin, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  search?: string;
  position?: string;
  status?: string;
}>;

async function getCandidates(search?: string, positionId?: string, status?: string) {
  const where: {
    OR?: Array<{
      fullName?: { contains: string; mode: "insensitive" };
      candidateCode?: { contains: string; mode: "insensitive" };
      phone?: { contains: string };
      email?: { contains: string; mode: "insensitive" };
    }>;
    positionId?: string;
    status?: string;
  } = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { candidateCode: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (positionId) {
    where.positionId = positionId;
  }

  if (status) {
    where.status = status;
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      position: {
        select: {
          title: true,
          department: true,
        },
      },
      photo: {
        select: {
          fileUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return candidates;
}

async function getPositions() {
  return await prisma.position.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });
}

export default async function CandidatesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const candidates = await getCandidates(params.search, params.position, params.status);
  const positions = await getPositions();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Talent Workspace
            </h1>
            <p className="text-slate-600 text-lg">
              Manage and review your candidate pipeline
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-11 px-6"
          >
            <Link href="/candidates/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-900/5">
          <div className="p-6">
            <form method="GET" className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search}
                  placeholder="Search by name, code, phone, or email..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div>
                <select
                  name="position"
                  defaultValue={params.position}
                  className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="">All Positions</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  name="status"
                  defaultValue={params.status}
                  className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-11 px-6"
              >
                Filter
              </Button>
            </form>
          </div>
        </Card>

        {/* Candidates List */}
        {candidates.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-900/5">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-slate-600 text-lg font-medium">No candidates found</p>
                <p className="text-slate-500 text-sm mt-2">
                  Click &quot;Add Candidate&quot; to register your first candidate
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="block group">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md shadow-slate-900/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:border-indigo-300">
                  <div className="p-5">
                    <div className="flex items-center gap-5">
                      {/* Photo */}
                      <Avatar size="lg">
                        {candidate.photo?.fileUrl ? (
                          <AvatarImage src={candidate.photo.fileUrl} alt={candidate.fullName} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                          {candidate.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {candidate.fullName}
                          </div>
                          <div className="text-sm text-slate-500 font-mono">{candidate.candidateCode}</div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-slate-900">{candidate.position.title}</div>
                          {candidate.currentJobTitle && (
                            <div className="text-xs text-slate-500">{candidate.currentJobTitle}</div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          {candidate.totalExperience !== null && (
                            <div className="text-sm text-slate-700">
                              <span className="text-slate-500">Exp:</span> {candidate.totalExperience}y
                            </div>
                          )}
                          {candidate.expectedSalary !== null && (
                            <div className="text-sm text-slate-700">
                              <span className="text-slate-500">Salary:</span> {candidate.salaryCurrency} {Number(candidate.expectedSalary).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-1 text-xs text-slate-500">
                            {candidate.currentCity && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {candidate.currentCity}
                              </div>
                            )}
                            {candidate.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {candidate.phone}
                              </div>
                            )}
                          </div>
                          <QuickStatusControl
                            candidateId={candidate.id}
                            currentStatus={candidate.status}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
