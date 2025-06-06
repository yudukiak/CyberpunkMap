import type { PinsRawObjectType, PinsLeafletObjectType } from "types/map";

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

export function decoratePins(pinsRaw: PinsRawObjectType[]): PinsLeafletObjectType[] {
  return pinsRaw.map((pinRaw) => {
    const { name, pins } = pinRaw;
    const decoratedPins = pins.map((pin) => {
      const { lat, lng, content, tag_id, is_public } = pin;
      let className = pinColor.gray;
      let zIndexOffset = 0;
      if (tag_id === "location") {
        className = pinColor.blue;
        zIndexOffset = 10000;
      }
      if (tag_id === "event") {
        className = pinColor.red;
        zIndexOffset = 10000;
      }
      if (is_public === false) {
        className += " brightness-50";
      }
      return { lat, lng, content, tag_id, className, zIndexOffset };
    });
    return { name, pins: decoratedPins };
  });
}