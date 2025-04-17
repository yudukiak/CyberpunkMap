import type { Route } from "./+types/_layout";
import { Outlet, useLocation } from "react-router";
import { Link, redirect } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ipMatches } from "~/utilities/ipFilter";

export async function loader({ request, context }: Route.LoaderArgs) {
  const ip = context?.reqIp as string;
  const isAdmin = ipMatches(ip);
  console.log("👘 - _layout.tsx - loader - context:", context);
  console.log("👘 - _layout.tsx - loader - isAdmin:", isAdmin);
  if (!isAdmin) return redirect("/");
}

const components: { title: string; href: string }[] = [
  {
    title: "Index",
    href: "/red/edit",
  },
  {
    title: "Team Edit",
    href: "/red/edit/team",
  },
  {
    title: "Map Edit",
    href: "/red/edit/map",
  },
];

export default function EditLayout() {
  const location = useLocation();
  return (
    <>
      <header className="h-12 px-4 flex items-center border-b border-neutral-800">
        <NavigationMenu>
          <NavigationMenuList>
            {components.map((component) => {
              const isActive =
                // 現在のパスがcomponent.hrefで始まり、他のcomponent.hrefが現在のパスで始まる場合はfalse
                // 例: /red/edit/team と /red/edit/team/1 の場合は /red/edit/team がアクティブ
                location.pathname.startsWith(component.href) &&
                !components.some(
                  (c) =>
                    c.href.length > component.href.length &&
                    location.pathname.startsWith(c.href)
                );
              return (
                <NavigationMenuItem key={component.title}>
                  <NavigationMenuLink
                    href={component.href}
                    asChild
                    active={isActive}
                  >
                    <Link
                      to={component.href}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-neutral-700 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {component.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main className="h-[calc(100dvh-calc(var(--spacing)*12))]">
        <Outlet />
      </main>
    </>
  );
}
