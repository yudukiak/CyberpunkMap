import Error from "~/components/error";
import Map from "~/features/map-view";

export default function Index() {
  return (
    <main className="h-dvh w-dvw">
      <Map system="edge" />
    </main>
  );
}

export function ErrorBoundary() {
  return <Error />;
}
