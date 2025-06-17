export type PinType = {
  short_id: string;
  lat: number;
  lng: number;
  content: string;
  tag_id: string;
  is_public: boolean;
}

export type TeamPinsType = {
  team_id: string;
  name: string;
  pins: PinType[];
}