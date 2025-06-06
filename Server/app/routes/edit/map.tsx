import type { Route } from "./+types/map";
import { Outlet } from "react-router";
import { createClient } from "~/lib/supabase";
import Error from "~/components/error";
import DataTable from "~/components/edit/data-table";
import { columns } from "~/components/edit-map/columns";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request, "public");
  const { data, error } = await supabase.from("red_map").select("*").order("id", { ascending: true });
  return { data, error };
}

export default function MapPage({ loaderData }: Route.ComponentProps) {
  const { data, error } = loaderData;
  if (error || data == null) return <ErrorBoundary />;
  return (
    <>
      <div className="h-full p-4">
        <DataTable columns={columns} data={data} />
      </div>
      <Outlet />
    </>
  );
}

export function ErrorBoundary() {
  return <Error />;
}