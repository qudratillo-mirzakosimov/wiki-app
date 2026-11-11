// Bolder fork: brand colours, from the Bolder Brand Standards in Figma
// (file yhqhkdtO3fdeTrCJj0ESDX, "04 Color" -> "41 · Tints for UI and data").
// The guide defines exactly ten orange tints (50..900), which map one-to-one onto
// Mantine's ten shades. Index 5 is Bolder Orange #FF4626 itself.
import type { MantineColorsTuple } from "@mantine/core";

export const primary: MantineColorsTuple = [
  "#FFF1EE", // 50
  "#FFDAD3", // 100
  "#FFB3A6", // 200
  "#FF8C78", // 300
  "#FF6A51", // 400
  "#FF4626", // 500  Bolder Orange
  "#E0381A", // 600
  "#B32B12", // 700
  "#801204", // 800  Rust
  "#4A0A02", // 900
];

// Which shade fills buttons. White on Bolder Orange (500) is 3.4:1, which the guide
// itself limits to large text ("43 · Accessible pairings"); Mantine buttons are 14px.
// 600 gives 4.4:1 and stays visibly on-brand, so it is the filled shade in both modes.
export const primaryShade = { light: 6, dark: 6 } as const;

export const fonts = {
  // "05 Typography": Inter for body, UI, labels; Montserrat Bold for headlines.
  body: '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: '"Montserrat Variable", Montserrat, Arial, sans-serif',
};
