import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { EditRequirementsForm } from "./form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPosition(id: string) {
  const position = await prisma.position.findUnique({
    where: { id },
  });

  return position;
}

export default async function EditRequirementsPage({ params }: PageProps) {
  const { id } = await params;
  const position = await getPosition(id);

  if (!position) {
    notFound();
  }

  return <EditRequirementsForm position={position} />;
}
