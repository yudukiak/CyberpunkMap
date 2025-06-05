import type { Route } from "./+types/team";
import { Outlet } from "react-router";
import { createClient } from "~/lib/supabase";
import Error from "~/components/error";
import DataTable from "~/components/data-table";
import { columns } from "~/components/edit-team/columns";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.from("red_team").select("*");
  return { data, error };
}

export default function MapPage({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
  return (
    <div className="p-4">
      <DataTable columns={columns} data={data} />
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  return <Error />;
}