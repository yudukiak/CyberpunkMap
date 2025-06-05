export type PinsRawType = {
  lat: number;
  lng: number;
  content: string | null;
  tag: string | null;
  is_public?: boolean;
}

export type PinsRawObjectType = {
  name: string;
  pins: PinsRawType[];
}

export type PinsLeafletType = {
  lat: number;
  lng: number;
  content: string | null;
  tag: string | null;
  className: string;
  zIndexOffset: number;
};

export type PinsLeafletObjectType = {
  name: string;
  pins: PinsLeafletType[];
};

