// Bolder fork: open-source stand-in for a Docmost Enterprise module.
// Written from scratch (AGPL-3.0); no Enterprise code is used. See oss/README.md.
export interface IApiKey {
  id: string;
  name: string;
  [key: string]: any;
}

export async function getApiKeys(_params?: any): Promise<any> { return { items: [], meta: {} }; }
