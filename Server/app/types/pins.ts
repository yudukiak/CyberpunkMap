export type PinType = {
  short_id: string;
  lat: number;
  lng: number;
  content: string;
  title: string | null;
  description: string | null;
  tag_id: string;
  is_public: boolean;
  className: string;
  zIndexOffset: number;
};

export type LeafletPinsType = {
  team_id: string;
  name: string;
  pins: PinType[];
};