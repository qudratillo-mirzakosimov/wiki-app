// Bolder fork: every in-app logo goes through here, so swapping the brand means replacing
// files in public/brand/ (or mounting over them) — no component edits.
import { getAppName } from "@/lib/config";

type BrandLogoProps = { size?: number };

export function BrandLogo({ size = 22 }: BrandLogoProps) {
  return (
    <img
      src="/brand/logo.svg"
      alt={getAppName()}
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
}
