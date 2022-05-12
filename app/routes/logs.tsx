import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getLogListItems } from "~/models/log.server";
import { useRef } from "react";

type LoaderData = {
  logListItems: Awaited<ReturnType<typeof getLogListItems>>;
  sort_by: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const sort_by = url.searchParams.get("sort_by");
  console.log({ sort_by });

  const logListItems = await getLogListItems({ userId, sort_by });
  return json<LoaderData>({ logListItems, sort_by });
};
export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let sort_by = formData.get("sort_by");
  console.log({ sort_by });
  return redirect("/logs?sort_by=" + sort_by);
};
export default function LogsPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Logs</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <div className=" flex items-center justify-between mr-4">
            <Link to="new" className="block p-4 text-xl text-blue-500">
              + New Log Entry
            </Link>
            <Form ref={formRef}>
              <select
                className="border px-2 py-1"
                name="sort_by"
                id="sort_by"
                defaultValue={data.sort_by ?? "datetime"}
                onChange={() => formRef.current?.submit()}
              >
                <option value="datetime">Start At</option>
                <option value="end_datetime">End At</option>
                <option value="createdAt">Created At</option>
                <option value="updatedAt">Updated At</option>
              </select>
            </Form>
          </div>
          <hr />
          {data.logListItems.length === 0 ? (
            <p className="p-4">No logs yet</p>
          ) : (
            <ol>
              {data.logListItems.map((log) => (
                <li key={log.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={log.id}
                  >
                    {`📝 ${log.datetime}`}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
