import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="flex flex-col space-y-4 p-4 lg:p-8">
      <h1 className="text-4xl font-bold">Welcome to demo Logs app</h1>
      <div className="">
        {user ? (
          <Link className="text-blue-600 underline" to="/logs">
            View Logs for {user.email}
          </Link>
        ) : (
          <div className="not-logged-in flex space-x-3">
            <Link className="text-blue-600 underline" to="/join">
              Sign up
            </Link>
            <span>OR</span>
            <Link className="text-blue-600 underline" to="/login">
              Log In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
