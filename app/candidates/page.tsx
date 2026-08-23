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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
              <p className="text-muted-foreground mt-2">
                Manage and review recruitment candidates
              </p>
            </div>
            <Button asChild>
              <Link href="/candidates/new">
                <Plus className="h-4 w-4" />
                Add Candidate
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <form method="GET" className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Search by name, code, phone, or email..."
                className="h-10 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div>
              <select
                name="position"
                defaultValue={params.position}
                className="h-10 rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                className="h-10 rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            <Button type="submit">Filter</Button>
          </form>
        </div>

        {/* Candidates List */}
        {candidates.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No candidates found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Click &quot;Add Candidate&quot; to register your first candidate
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="block">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Photo */}
                    <Avatar size="lg">
                      {candidate.photo?.fileUrl ? (
                        <AvatarImage src={candidate.photo.fileUrl} alt={candidate.fullName} />
                      ) : null}
                      <AvatarFallback>
                        {candidate.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <div className="font-medium">{candidate.fullName}</div>
                        <div className="text-sm text-muted-foreground">{candidate.candidateCode}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">{candidate.position.title}</div>
                        {candidate.currentJobTitle && (
                          <div className="text-xs text-muted-foreground">{candidate.currentJobTitle}</div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        {candidate.totalExperience !== null && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Exp:</span> {candidate.totalExperience}y
                          </div>
                        )}
                        {candidate.expectedSalary !== null && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Salary:</span> {candidate.salaryCurrency} {Number(candidate.expectedSalary).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
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
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
