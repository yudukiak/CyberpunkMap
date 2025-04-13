import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  // /red
  ...prefix("red", [
    index("routes/red/index.tsx"),
    route(":teamId", "routes/red/team.tsx"),
    // /red/edit
    ...prefix("edit", [
      layout("routes/red/edit/_layout.tsx", [
        index("routes/red/edit/index.tsx"),
        route("team", "routes/red/edit/team.tsx"),
        route("map", "routes/red/edit/map.tsx"),
      ]),
    ])
  ]),

] satisfies RouteConfig;
