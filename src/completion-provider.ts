'use babel'

import {
  AutocompleteProvider,
  SuggestionsRequestedEvent,
  Suggestions,
  SuggestionInsertedEvent,
} from "atom/autocomplete-plus";
import { RangeCompatible } from "atom";
import { autocompleteHttp } from './providers/remote/utils'
import * as types from './providers/remote/types';

export class CompletionProvider implements AutocompleteProvider {

  selector: string;
  disableForSelector?: string | undefined;
  inclusionPriority?: number | undefined;
  suggestionPriority?: number | undefined;
  excludeLowerPriority?: boolean | undefined;
  filterSuggestions?: boolean | undefined;

  constructor() {
    this.selector = '.py';
    this.inclusionPriority = 6;
    this.suggestionPriority = 8;
    this.excludeLowerPriority = true;
    this.filterSuggestions = false;
  }

  async getSuggestions(params: SuggestionsRequestedEvent): Promise<Suggestions> {
    const { editor, bufferPosition } = params;
    const repo = atom.project.getRepositories()[0]
    var beforeContext: types.Line[] = [];
    for (var i = Math.max(0, bufferPosition.row - 3); i < bufferPosition.row; i++) {
      beforeContext.push({line_num: i + 1, source: editor.lineTextForBufferRow(i) + "\n"})
    }

    const response = await autocompleteHttp({
        repo_path: repo.getWorkingDirectory(),
        commit_msg: "Need to figure out where to stash this.",
        path: atom.project.relativizePath(editor.getPath())[1],
        context_lines: beforeContext,
        path_filters: [".py"],
        current_line: {
          source: editor.lineTextForBufferRow(bufferPosition.row) + "\n",
          line_num: bufferPosition.row + 1,
          caret: bufferPosition.column
        }
      });

    return response.responses?.map((entry) => {
      return {
        text: entry.value,
        displayText: entry.value.substring(0, 64),
        replacementPrefix: params.prefix,
        description: "test description",
        descriptionMoreURL: "https://github.com/Laredo-Labs"
      }
    }) || [];
  }

  onDidInsertSuggestion(params : SuggestionInsertedEvent): void {
    const checkpoint = (<any>params.suggestion).checkpoint;
    const replacementPrefix = params.suggestion.replacementPrefix;
    const currentPosition = params.editor.getCursorBufferPosition();
    const replacementRange:RangeCompatible = [
      currentPosition,
      currentPosition.translate([0, replacementPrefix.length])
    ];

    const existingSuffix = params.editor.getTextInBufferRange(replacementRange);
    if (replacementPrefix.length && existingSuffix === replacementPrefix) {
      params.editor.getBuffer().delete(replacementRange);
      params.editor.groupChangesSinceCheckpoint(checkpoint);
    }
  }

  dispose() {

  }

  formatMarkdown(prefix: string, replacement: string): string {
    return `__Description using Markdown__\nChoosing this option will replace ${prefix} with ${replacement}.`
  }
}
