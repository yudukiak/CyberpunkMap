import type { Route } from "./+types/map";
import { Outlet } from "react-router";
import { createClient } from "~/lib/supabase";
import Error from "~/components/error";
import DataTable from "~/components/edit/data-table";
import { columns } from "~/components/edit-map/columns";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Plus } from "lucide-react";

export function meta() {
  const title = ["Map", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

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
      <Link to="/edit/map/add" className="fixed top-1.5 right-1.5 z-11">
        <Button variant="outline" className="h-9 w-9">
          <Plus />
        </Button>
      </Link>
      <Outlet />
      <Toaster expand={true} richColors />
    </>
  );
}

export function ErrorBoundary() {
  console.log("routes/edit/map.tsx");
  return <Error />;
}