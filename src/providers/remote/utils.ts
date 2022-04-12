'use babel'

import * as types from './types';

const axios = require('axios').default;
const service = axios.create({
  baseURL: "http://127.0.0.1:5000",
  timeout: 5000
});

export async function autocompleteHttp(params: types.Request): Promise<types.Response> {
  const response = await service.post('/generate', params);
  return {
    responses: response.data?.map((entry: any) => {
      return {
        confidence: -1.0,
        value: entry
      }
    }) || []
  }
}
