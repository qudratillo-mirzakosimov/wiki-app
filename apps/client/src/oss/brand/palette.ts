// Bolder fork: brand colours. Mantine needs ten shades per colour (index 6 is the main one
// in light mode). Placeholder: these are upstream's blue, so nothing changes until the real
// brand colour arrives — then generate ten shades from it and replace `primary`.
import type { MantineColorsTuple } from "@mantine/core";

export const primary: MantineColorsTuple = [
  "#e7f3ff",
  "#d0e4ff",
  "#a1c6fa",
  "#6ea6f6",
  "#458bf2",
  "#2b7af1",
  "#0b60d8",
  "#1b72f2",
  "#0056c1",
  "#004aac",
];
