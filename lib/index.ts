/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */

import fetch from 'isomorphic-fetch';

interface Query {
  [key: string]: string | string[] | undefined;
}

function encodeBasicAuth(username: string, password: string): string {
  const str = `${username}:${password}`;
  const buffer = Buffer.from(str);
  return `Basic ${buffer.toString('base64')}`;
}

export class ApiClientError extends Error {
  body: any;

  code?: string;

  field?: string;

  status: number;

  constructor(status: number, body: any) {
    super(body.message);
    this.name = `HTTP${status}`;
    this.code = body.code;
    this.field = body.field;
    this.body = body;
    this.status = status;
  }
}

interface HeadersProvider {
  (): Promise<{[key: string]: string | undefined}>;
}

async function headersNoop() {
  return {};
}

export function bearerTokenHeaders(accessToken: string | null) {
  if (!accessToken) return headersNoop;
  const Authorization = `Bearer ${accessToken}`;
  return async () => {
    return { Authorization };
  };
}

export default class ApiClient {
  private baseUrl: string;
  private getHeaders: HeadersProvider;

  constructor(baseUrl: string, getHeaders?: HeadersProvider) {
    this.baseUrl = baseUrl;
    this.getHeaders = getHeaders || headersNoop;
  }

  withAccessToken(value: string | null) {
    return new ApiClient(this.baseUrl, bearerTokenHeaders(value));
  }

  withBasicAuth(username: string, password: string) {
    const Authorization = encodeBasicAuth(username, password);
    return new ApiClient(this.baseUrl, async () => {
      return { Authorization };
    });
  }

  async invalidate() {
    return null;
  }

  async request(method: string, path: string, query: Query | undefined, body?: any) {
    const url = new URL(this.baseUrl + path);

    if (query) {
      Object.keys(query || {}).forEach((name) => {
        const val = query[name];
        if (Array.isArray(val)) {
          val.forEach((v) => {
            url.searchParams.append(name, v);
          });
        } else {
          url.searchParams.append(name, val || '');
        }
      });
    }

    const params: any = {
      method,
      headers: await this.getHeaders(),
    };

    if (body) {
      params.headers['Content-Type'] = 'application/json';
      params.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), params);
    const contentType = response.headers.get('Content-Type');

    if (response.status === 401) {
      await this.invalidate();
    }
    let json: any;
    if (/^application\/json/.test(contentType || '')) {
      json = await response.json();
    }

    // console.log(url.toString(), response.status, json);
    if (response.status >= 400) throw new ApiClientError(response.status, json);
    return json;
  }

  async get(path: string, query?: Query) {
    return this.request('GET', path, query);
  }

  async post(path: string, body: any, query?: Query) {
    return this.request('POST', path, query, body);
  }

  async delete(path: string, body: any, query?: Query) {
    return this.request('DELETE', path, query, body);
  }
}
