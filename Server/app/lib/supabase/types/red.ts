export type RedMap = {
  id: number;
  created_at: string;
  is_public: boolean;
  lat: number;
  lng: number;
  content: string;
  team_id: string;
  tag_id: string;
  short_id: string;
  title: string | null;
  description: string | null;
}

export type RedTag = {
  id: string;
  name: string;
  is_public: boolean;
};

export type RedTeam = {
  id: string;
  name: string;
  is_public: boolean;
};