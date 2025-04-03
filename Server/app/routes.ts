import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("red", "routes/red.tsx"),
  route("api", "routes/api.tsx"),
] satisfies RouteConfig;
