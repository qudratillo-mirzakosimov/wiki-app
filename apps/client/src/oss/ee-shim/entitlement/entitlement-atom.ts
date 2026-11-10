// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
import { atom } from "jotai";

export type Entitlements = { tier: string; features: string[] };

export const entitlementAtom = atom<Entitlements | null>({ tier: "free", features: [] });
