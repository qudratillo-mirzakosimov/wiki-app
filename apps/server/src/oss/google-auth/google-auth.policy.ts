// Bolder fork: who may sign in with Google. Pure functions, no I/O, so the rules are unit
// tested on their own (google-auth.policy.spec.ts).

export type GoogleAuthConfig = {
  clientId: string;
  clientSecret: string;
  allowedDomains: string[];
};

// Google sign-in is on only when all three values are set. An empty domain list disables it
// rather than meaning "any Google account": the fork matches users by email, so an open
// domain list would let anyone who controls a matching gmail address sign in as that user.
export function readGoogleAuthConfig(
  env: NodeJS.ProcessEnv = process.env,
): GoogleAuthConfig | null {
  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  const allowedDomains = (env.GOOGLE_ALLOWED_DOMAINS ?? '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (!clientId || !clientSecret || allowedDomains.length === 0) return null;
  return { clientId, clientSecret, allowedDomains };
}

// Reason codes travel to the login page as ?google_error=<code>; the client maps them to text.
export type GoogleRejectReason =
  | 'email_unverified'
  | 'domain_not_allowed'
  | 'not_a_member'
  | 'cancelled'
  | 'failed';

export class GoogleAuthRejected extends Error {
  constructor(readonly reason: GoogleRejectReason) {
    super(reason);
  }
}

// Returns the lower-cased email the user may be signed in as, or throws GoogleAuthRejected.
//
// Both `hd` and the email's domain must be on the list. `hd` is only present for Google
// Workspace accounts, and Google sets it from the account itself, so it proves the
// organisation owns the mailbox; the email check alone would also admit a personal Google
// account registered on a work address.
export function acceptGoogleClaims(
  claims: Record<string, unknown>,
  allowedDomains: string[],
): string {
  const email =
    typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';
  if (!email || claims.email_verified !== true) {
    throw new GoogleAuthRejected('email_unverified');
  }

  const emailDomain = email.split('@')[1] ?? '';
  const hd = typeof claims.hd === 'string' ? claims.hd.toLowerCase() : '';
  if (!allowedDomains.includes(emailDomain) || !allowedDomains.includes(hd)) {
    throw new GoogleAuthRejected('domain_not_allowed');
  }

  return email;
}
