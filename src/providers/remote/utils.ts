'use babel'

import * as types from './types';

const axios = require('axios').default;
const service = axios.create({
  baseURL: "https://random-word-api.herokuapp.com",
  timeout: 5000
});

export async function autocompleteHttp(params: types.Request): Promise<types.Response> {
  const response = await service.get('/word', {params: {number:  10, swear: 0}});

  return {
    prefix: params.prefix,
    responses: response.data?.map((entry: any) => {
      return {
        confidence: -1.0,
        value: entry
      }
    })
  }
}
