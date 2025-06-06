import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  // /red
  ...prefix("red", [
    index("routes/red/index.tsx"),
    route(":teamId", "routes/red/team.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  //route("signup", "routes/signup.tsx"),
  // /edit
  ...prefix("edit", [
    layout("routes/edit/layout.tsx", [
      index("routes/edit/index.tsx"),
      route("team", "routes/edit/team.tsx", [
        route(":teamId", "routes/edit/team-edit.tsx"),
      ]),
      route("map", "routes/edit/map.tsx", [
        route(":mapId", "routes/edit/map-edit.tsx"),
        route("add", "routes/edit/map-add.tsx"),
      ]),
    ]),
  ]),

] satisfies RouteConfig;
