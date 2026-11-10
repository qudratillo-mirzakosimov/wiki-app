// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
import { Navigate } from "react-router-dom";

// Routes that pointed at Enterprise pages land back on home instead of a blank screen.
export function Unavailable() {
  return <Navigate to="/home" replace />;
}

export function Nothing(_props: any): null {
  return null;
}

// Mirrors the parts of a react-query mutation the core reads, so call sites type-check.
export function useDisabledMutation(): any {
  return { mutate: () => {}, mutateAsync: async () => {}, isPending: false };
}
