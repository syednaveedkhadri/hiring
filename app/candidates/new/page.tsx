import { NewCandidateForm } from "./form";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function getPositions() {
  const positions = await prisma.position.findMany({
    where: {
      status: "OPEN",
    },
    orderBy: {
      title: "asc",
    },
    select: {
      id: true,
      title: true,
      department: true,
    },
  });
  return positions;
}

export default async function NewCandidatePage() {
  const positions = await getPositions();

  return <NewCandidateForm positions={positions} />;
}
