// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
export interface IAuthProvider {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}
