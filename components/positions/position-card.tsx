import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users } from "lucide-react";

type PositionCardProps = {
  id: string;
  title: string;
  department: string | null;
  vacancies: number;
  seniorityLevel: string | null;
  status: string;
  candidateCount: number;
};

export function PositionCard({
  id,
  title,
  department,
  vacancies,
  seniorityLevel,
  status,
  candidateCount,
}: PositionCardProps) {
  const statusColors = {
    OPEN: "bg-green-100 text-green-700 border-green-200",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
    ON_HOLD: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <Link href={`/positions/${id}`} className="block group">
      <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200 shadow-md shadow-slate-900/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:border-indigo-300 overflow-hidden">
        {/* Header gradient bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {title}
              </CardTitle>
              {department && (
                <p className="text-sm text-slate-600 mt-1 font-medium">{department}</p>
              )}
            </div>
            <Badge
              className={`${statusColors[status as keyof typeof statusColors] || statusColors.CLOSED} border font-semibold text-xs px-2.5 py-0.5`}
            >
              {status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{vacancies}</div>
                <div className="text-xs text-slate-500">
                  {vacancies === 1 ? "Vacancy" : "Vacancies"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{candidateCount}</div>
                <div className="text-xs text-slate-500">
                  {candidateCount === 1 ? "Candidate" : "Candidates"}
                </div>
              </div>
            </div>
          </div>

          {seniorityLevel && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Seniority Level</span>
                <span className="font-semibold text-slate-900">{seniorityLevel}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
