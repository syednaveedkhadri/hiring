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
  return (
    <Link href={`/positions/${id}`} className="block transition-all hover:scale-[1.02]">
      <Card className="h-full cursor-pointer hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {department && (
                <p className="text-sm text-muted-foreground mt-1">{department}</p>
              )}
            </div>
            <Badge variant={status === "OPEN" ? "default" : "secondary"}>
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{vacancies}</span>
              <span className="text-muted-foreground">
                {vacancies === 1 ? "Vacancy" : "Vacancies"}
              </span>
            </div>

            {seniorityLevel && (
              <div className="text-sm">
                <span className="text-muted-foreground">Level: </span>
                <span className="font-medium">{seniorityLevel}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm pt-2 border-t">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{candidateCount}</span>
              <span className="text-muted-foreground">
                {candidateCount === 1 ? "Candidate" : "Candidates"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
