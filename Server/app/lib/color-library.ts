// 設定
type TeamColor = { [key: string]: { background: string } };
const teamColor: TeamColor = {
  miscrunners: {
    background: "bg-indigo-800",
  },
  rulebook: {
    background: "bg-neutral-800",
  },
  teamccfolia: {
    background: "bg-red-800",
  },
  test: {
    background: "bg-neutral-800",
  },
};
type TagColor = { [key: string]: { background: string } };
const tagColor: TagColor = {
  event: {
    background: "bg-pink-800",
  },
  location: {
    background: "bg-sky-800",
  },
  none: {
    background: "bg-neutral-800",
  },
};
const undefinedColor = {
  background: "bg-neutral-800",
};

// 色が欲しいID
type ColorLibrary = {
  team_id?: string;
  tag_id?: string;
};

export function getColor({ team_id, tag_id }: ColorLibrary) {
  const team = team_id ? teamColor[team_id] : undefinedColor;
  const tag = tag_id ? tagColor[tag_id] : undefinedColor;
  return { team, tag };
}
