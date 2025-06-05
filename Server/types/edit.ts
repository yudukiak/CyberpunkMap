export type RedTeam = {
  id: string;
  name: string;
  is_public: boolean;
};

export type RedMap = {
  id: number;
  lat: number;
  lng: number;
  content: string;
  created_at: string;
  is_public: boolean;
  team_id: string;
  tag: string;
};

export type LoaderData = {
  team: RedTeam[],
  redMap: RedMap[],
  error: string | null,
}