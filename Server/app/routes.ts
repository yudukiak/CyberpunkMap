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
        route(":teamId", "routes/edit/teamId.tsx"),
      ]),
      route("map", "routes/edit/map.tsx", [
        route(":mapId", "routes/edit/mapId.tsx"),
      ]),
    ]),
  ]),
  /*
  ...prefix("red", [
    index("routes/red/index.tsx"),
    route(":teamId", "routes/red/team.tsx"),
    // /red/edit
    ...prefix("edit", [
      layout("routes/red/edit/_layout.tsx", [
        index("routes/red/edit/index.tsx"),
        route("team", "routes/red/edit/team.tsx", [
          route(":teamId", "routes/red/edit/teamId.tsx"),
        ]),
        route("map", "routes/red/edit/map.tsx", [
          route(":mapId", "routes/red/edit/mapId.tsx"),
        ]),
      ]),
    ])
  ]),
    */

] satisfies RouteConfig;
