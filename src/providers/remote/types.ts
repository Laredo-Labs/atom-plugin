'use babel'

export type Request = {
  prefix: string;
  filename: string;
  beforeContext?: string | undefined;
  afterContext?: string | undefined;
}

export type Response = {
  prefix: string;
  responses: ResponseEntry[];
}

export type ResponseEntry = {
  confidence: number;
  value: string;
}
