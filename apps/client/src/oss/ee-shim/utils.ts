// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
// Cloud multi-tenant helpers; self-hosted never redirects between hostnames.
export function getHostnameUrl(_hostname: string): string {
  return window.location.origin;
}

export function exchangeTokenRedirectUrl(_hostname: string, _token: string): string {
  return window.location.origin + "/home";
}
