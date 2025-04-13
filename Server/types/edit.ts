export type RedTeam = {
  id: number;
  name: string;
  member_ids: number[];
  is_public: boolean;
  key: string;
};

export type RedMap = {
  id: number;
  lat: number;
  lng: number;
  content: string;
  created_at: string;
  is_public: boolean;
  team_ids: number[];
  member_ids: number[];
  rulebook_ids: number[];
  tags: string[];
};

export type LoaderData = {
  team: RedTeam[],
  redMap: RedMap[],
  error: string | null,
}