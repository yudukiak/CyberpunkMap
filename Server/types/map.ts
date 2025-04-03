export type PinsType = {
  lat: number;
  lng: number;
  content?: string;
  pin_color?: string;
};

export type MapClientProps = {
  loaderData: {
    error: string | null;
    pins: PinsType[];
  };
};