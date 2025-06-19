import type { TeamPinsType } from "~/lib/supabase/types/rpc";
import type { LeafletPinsType } from "~/types/pins";

const pinColor = {
  blue: "hue-rotate-[0deg]",
  indigo: "hue-rotate-[30deg]",
  violet: "hue-rotate-[60deg]",
  pink: "hue-rotate-[90deg]",
  red: "hue-rotate-[120deg]",
  orange: "hue-rotate-[150deg]",
  amber: "hue-rotate-[180deg]",
  yellow: "hue-rotate-[210deg]",
  lime: "hue-rotate-[240deg]",
  green: "hue-rotate-[270deg]",
  teal: "hue-rotate-[300deg]",
  cyan: "hue-rotate-[330deg]",
  gray: "grayscale",
};

export function decoratePins(pinsRaw: TeamPinsType[]): LeafletPinsType[] {
  return pinsRaw.map((pinRaw) => {
    const { team_id, name, pins } = pinRaw;
    const decoratedPins = pins.map((pin) => {
      let className = pinColor.gray;
      let zIndexOffset = 0;
      if (pin.tag_id === "location") {
        className = pinColor.blue;
        zIndexOffset = 10000;
      }
      if (pin.tag_id === "event") {
        className = pinColor.red;
        zIndexOffset = 10000;
      }
      if (pin.is_public === false) {
        className += " brightness-50";
      }
      return { ...pin, className, zIndexOffset };
    });
    return { team_id, name, pins: decoratedPins };
  });
}