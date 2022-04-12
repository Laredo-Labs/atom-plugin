'use babel'

export type Request = {
  repo_path: string;
  server_url?: string | undefined
  commit_msg?: string | undefined;
  path?: string | undefined;
  current_line?: CurrentLine | undefined;
  context_lines?: Line[] | undefined;
  path_filters?: String[] | undefined; 
}

export type Response = {
  responses: ResponseEntry[];
}

export type ResponseEntry = {
  confidence: number;
  value: string;
}

export type Line = {
  line_num: number;
  source: string;
}

export type CurrentLine = {
  line_num: number;
  source: string;
  caret: number;
}
