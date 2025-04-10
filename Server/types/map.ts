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
};

export type loaderData = {
  loaderData: {
    pins: PinsObjectType[];
    title: string | null;
    error: string | null;
  };
};
