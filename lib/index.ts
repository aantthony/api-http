/* eslint-disable max-classes-per-file */

import fetch from 'isomorphic-fetch';

interface Query {
  [key: string]: string | string[] | undefined;
}

export class ApiClientError extends Error {
  body: any;

  code?: string;

  field?: string;

  status: number;

  message: string;

  constructor(status: number, body: any) {
    super(body.message);
    this.message = body.message;
    this.name = `HTTP${status}`;
    this.code = body.code;
    this.field = body.field;
    this.body = body;
    this.status = status;
  }
}

export default class ApiClient {
  private baseUrl: string;

  accessToken: string | null;

  constructor(baseUrl: string, accessToken: string | null) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  async getHeaders() {
    if (this.accessToken) {
      const value = this.accessToken;
      if (!value) return {};

      return {
        Authorization: `Bearer ${value}`,
      };
    }
    return {};
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

  async delete(path: string, body?: any, query?: Query) {
    return this.request('DELETE', path, query, body);
  }
}
