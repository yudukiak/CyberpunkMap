import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("edit", "routes/edit/index.tsx"),
  route("red", "routes/red/index.tsx"),
] satisfies RouteConfig;
