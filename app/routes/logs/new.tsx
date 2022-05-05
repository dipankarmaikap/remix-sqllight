import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { createLog } from "~/models/log.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    datetime?: string;
    end_datetime?: string;
    description?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const datetime = formData.get("datetime");
  const end_datetime = formData.get("end_datetime");
  const description = formData.get("description");

  if (typeof datetime !== "string" || datetime.length === 0) {
    return json<ActionData>(
      { errors: { datetime: "Datetime is required" } },
      { status: 400 }
    );
  }
  if (typeof end_datetime !== "string" || end_datetime.length === 0) {
    return json<ActionData>(
      { errors: { end_datetime: "end_datetime is required" } },
      { status: 400 }
    );
  }
  if (typeof description !== "string" || description.length === 0) {
    return json<ActionData>(
      { errors: { description: "description is required" } },
      { status: 400 }
    );
  }

  const log = await createLog({
    datetime: new Date(datetime),
    end_datetime: new Date(end_datetime),
    description,
    userId,
  });

  return redirect(`/logs/${log.id}`);
};

export default function NewLogPage() {
  const actionData = useActionData() as ActionData;
  const datetimeRef = useRef<HTMLInputElement>(null);
  const end_datetimeRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.datetime) {
      datetimeRef.current?.focus();
    } else if (actionData?.errors?.end_datetime) {
      end_datetimeRef.current?.focus();
    } else if (actionData?.errors?.description) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post" className="flex flex-col space-y-4">
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Datetime: </span>
          <input
            ref={datetimeRef}
            type="datetime-local"
            name="datetime"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.datetime ? true : undefined}
            aria-errormessage={
              actionData?.errors?.datetime ? "datetime-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.datetime && (
          <div className="pt-1 text-red-700" id="datetime-error">
            {actionData.errors.datetime}
          </div>
        )}
      </div>
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>End_datetime: </span>
          <input
            ref={end_datetimeRef}
            name="end_datetime"
            type="datetime-local"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.end_datetime ? true : undefined}
            aria-errormessage={
              actionData?.errors?.end_datetime
                ? "end_datetime-error"
                : undefined
            }
          />
        </label>
        {actionData?.errors?.end_datetime && (
          <div className="pt-1 text-red-700" id="end_datetime-error">
            {actionData.errors.end_datetime}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Description: </span>
          <textarea
            ref={bodyRef}
            name="description"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.description ? true : undefined}
            aria-errormessage={
              actionData?.errors?.description ? "description-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.description && (
          <div className="pt-1 text-red-700" id="description-error">
            {actionData.errors.description}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
