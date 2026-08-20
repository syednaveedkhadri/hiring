import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/db/prisma";
import { ArrowLeft, Briefcase, Users, DollarSign, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          candidates: true,
        },
      },
    },
  });

  return position;
}

export default async function PositionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const position = await getPosition(id);

  if (!position) {
    notFound();
  }

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null) return "Not specified";
    return `${currency || "KWD"} ${amount.toLocaleString()}`;
  };

  const formatExperience = (years: number | null) => {
    if (years === null) return "Not specified";
    return `${years} ${years === 1 ? "year" : "years"}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/positions">
              <ArrowLeft className="h-4 w-4" />
              Back to Positions
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{position.title}</h1>
              {position.department && (
                <p className="text-lg text-muted-foreground mt-2">{position.department}</p>
              )}
            </div>
            <Badge variant={position.status === "OPEN" ? "default" : "secondary"} className="text-sm">
              {position.status}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{position.vacancies}</p>
                    <p className="text-sm text-muted-foreground">
                      {position.vacancies === 1 ? "Vacancy" : "Vacancies"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{position._count.candidates}</p>
                    <p className="text-sm text-muted-foreground">
                      {position._count.candidates === 1 ? "Candidate" : "Candidates"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(position.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Seniority Level</label>
                  <p className="mt-1">{position.seniorityLevel || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="mt-1">{position.department || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {position.jobDescription || "Not specified"}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mandatory Requirements</label>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {position.mandatoryRequirements || "Not specified"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Requirements</label>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {position.preferredRequirements || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Experience</label>
                  <p className="mt-1">{formatExperience(position.minimumExperience)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Experience</label>
                  <p className="mt-1">{formatExperience(position.preferredExperience)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Salary</label>
                  <p className="mt-1">
                    {formatCurrency(position.salaryMin ? Number(position.salaryMin) : null, position.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maximum Salary</label>
                  <p className="mt-1">
                    {formatCurrency(position.salaryMax ? Number(position.salaryMax) : null, position.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="mt-1">{position.currency || "KWD"}</p>
                </div>
              </div>
              {position.salaryMin && position.salaryMax && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Salary Range</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(Number(position.salaryMin), position.currency)} -{" "}
                    {formatCurrency(Number(position.salaryMax), position.currency)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
