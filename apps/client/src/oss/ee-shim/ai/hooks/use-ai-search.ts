// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
// Module-level no-ops so the effect that depends on them keeps a stable identity.
const noop = () => {};

const idle = {
  mutate: noop,
  data: undefined,
  isPending: false,
  reset: noop,
  error: null,
  streamingAnswer: "",
  streamingSources: [],
  clearStreaming: noop,
};

export function useAiSearch(): any {
  return idle;
}
