import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("edit", "routes/edit/index.tsx"),
  ...prefix("red", [
    index("routes/red/index.tsx"),
    route(":teamId", "routes/red/team.tsx"),
  ]),

] satisfies RouteConfig;
