import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Log } from "~/models/log.server";
import { deleteLog } from "~/models/log.server";
import { getLog } from "~/models/log.server";
import { requireUserId } from "~/session.server";
import { generateLocalTime } from "~/utils";

type LoaderData = {
  log: Log;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.logId, "logId not found");

  const log = await getLog({ userId, id: params.logId });
  if (!log) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ log });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.logId, "logId not found");

  await deleteLog({ userId, id: params.logId });

  return redirect("/logs");
};

export default function LogDetailsPage() {
  const data = useLoaderData() as LoaderData;
  let datetime = generateLocalTime(data.log.datetime);
  let end_datetime = generateLocalTime(data.log.end_datetime);

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.log.datetime}</h3>
      <p className="py-6">
        <span>Datetime</span> {datetime} - <span>End datetime</span>{" "}
        {end_datetime}
      </p>
      <p className="py-6">{data.log.description}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div>
        <h1>Log not found It can be any of the below reasons</h1>
        <ul className="ml-8  mt-4 list-item list-disc">
          <li>Log has been deleted</li>
          <li>You are not the owner of this log</li>
          <li>You are just messing with my app</li>
        </ul>
      </div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
