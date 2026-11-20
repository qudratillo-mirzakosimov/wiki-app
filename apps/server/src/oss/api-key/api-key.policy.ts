// Bolder fork: the per-instance switch for personal API keys. A pure function, no I/O, so the
// rule is unit tested on its own (api-key.policy.spec.ts).
//
// Written for this fork (AGPL-3.0); it does not use the Enterprise API-key code.

// Off unless the value is exactly "true" (after trimming). "1", "yes" and "TRUE" are
// deliberately not accepted: a switch that guards credentials should have one spelling, so a
// typo fails closed instead of being guessed at.
export function isApiKeysEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.API_KEYS_ENABLED?.trim() === 'true';
}
