import type { User, Log } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Log } from "@prisma/client";

export function getLog({
  id,
  userId,
}: Pick<Log, "id"> & {
  userId: User["id"];
}) {
  return prisma.log.findFirst({
    where: { id, userId },
  });
}

export function getLogListItems({
  userId,
  sort_by,
}: {
  userId: User["id"];
  sort_by: string | null;
}) {
  const orderBy = { [sort_by ?? "datetime"]: "desc" };

  return prisma.log.findMany({
    where: { userId },
    select: { id: true, datetime: true },
    orderBy,
  });
}

export function createLog({
  datetime,
  end_datetime,
  description,
  userId,
}: Pick<Log, "description" | "datetime" | "end_datetime"> & {
  userId: User["id"];
}) {
  return prisma.log.create({
    data: {
      datetime,
      end_datetime,
      description,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteLog({
  id,
  userId,
}: Pick<Log, "id"> & { userId: User["id"] }) {
  return prisma.log.deleteMany({
    where: { id, userId },
  });
}
