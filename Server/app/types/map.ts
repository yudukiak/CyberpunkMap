export type PinsRawType = {
  short_id: string;
  lat: number;
  lng: number;
  content: string;
  tag_id: string;
  is_public: boolean;
}

export type PinsRawObjectType = {
  team_id: string;
  name: string;
  pins: PinsRawType[];
}

export type PinsLeafletType = {
  short_id: string;
  lat: number;
  lng: number;
  content: string;
  tag_id: string;
  is_public: boolean;
  className: string;
  zIndexOffset: number;
};

export type PinsLeafletObjectType = {
  team_id: string;
  name: string;
  pins: PinsLeafletType[];
};

export type MoveMapCenterType = {
  lat: number;
  lng: number;
  content: string;
  date: string;
}