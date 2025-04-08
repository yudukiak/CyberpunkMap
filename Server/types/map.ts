export type PinsType = {
  lat: number;
  lng: number;
  content: string;
  tags: string[];
  className: string;
  zIndexOffset: number;
};

export type PinsObjectType = {
  name: string;
  pins: PinsType[];
}

export type loaderData = {
  error: string | null;
  pins: PinsObjectType[];
}