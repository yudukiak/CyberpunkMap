export type RedTeam = {
  id: string;
  name: string;
  is_public: boolean;
};

export type RedMap = {
  id: number;
  short_id: string;
  lat: number;
  lng: number;
  content: string;
  created_at: string;
  is_public: boolean;
  team_id: string;
  tag_id: string;
};

export type RedTag = {
  id: string;
  name: string;
  is_public: boolean;
};
