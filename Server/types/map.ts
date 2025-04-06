// DB（red_map）から取得するデータの型定義
export type RedMapRow = {
  id: number;
  lat: number;
  lng: number;
  content: string | null;
  created_at: string;
  is_public: Boolean;
  team_ids: number[];
  member_ids: number[];
  rulebook_ids: number[];
  tags: string[];
};

// DB（red_team）から取得するデータの型定義
export type RedTeamRow = {
  id: number;
  name: string;
  menber_ids: number[];
  is_public: Boolean;
  key: string;
};

export type PinsType = {
  lat: number;
  lng: number;
  content: string;
  className: string;
  zIndexOffset: number;
};

export type MapClientProps = {
  loaderData: {
    error: string | null;
    pins: PinsType[];
  };
};
