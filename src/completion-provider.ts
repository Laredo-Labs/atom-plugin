'use babel'

import {
  AutocompleteProvider,
  SuggestionsRequestedEvent,
  Suggestions,
  SuggestionInsertedEvent,
} from "atom/autocomplete-plus";
import { RangeCompatible } from "atom";
import { autocompleteHttp } from './providers/remote/utils'

const CHAR_LIMIT = 1024;

export class CompletionProvider implements AutocompleteProvider {

  selector: string;
  disableForSelector?: string | undefined;
  inclusionPriority?: number | undefined;
  suggestionPriority?: number | undefined;
  excludeLowerPriority?: boolean | undefined;
  filterSuggestions?: boolean | undefined;

  constructor() {
    this.selector = '.text.plain';
    this.inclusionPriority = 6;
    this.suggestionPriority = 8;
    this.excludeLowerPriority = true;
    this.filterSuggestions = false;
  }

  async getSuggestions(params: SuggestionsRequestedEvent): Promise<Suggestions> {
    console.log("getSuggestions")
    const { editor, bufferPosition } = params;

    const offset = editor.getBuffer().characterIndexForPosition(bufferPosition);
    console.log("offset", offset)

    const beforeStartOffset = editor.getBuffer().positionForCharacterIndex(Math.max(0, offset - CHAR_LIMIT));
    console.log("before max offset", beforeStartOffset)

    const afterEndOffset = editor.getBuffer().positionForCharacterIndex(Math.min(editor.getBuffer().getMaxCharacterIndex(), offset + CHAR_LIMIT));
    console.log("after max offset", afterEndOffset)
    // const beforeStart = editor.getBuffer().characterIndexForPosition(beforeStartOffset);

    const before = editor.getBuffer().getTextInRange([beforeStartOffset, bufferPosition]);
    const after = editor.getBuffer().getTextInRange([bufferPosition, afterEndOffset]);

    const response = await autocompleteHttp(
      {
        prefix: params.prefix,
        filename: editor.getBuffer().getPath(),
        beforeContext: before,
        afterContext: after
      }
    );

    return response.responses?.map((entry) => {
      return {
        type: "snippet",
        snippet: entry.value,
        replacementPrefix: params.prefix,
        description: "Random word from https://random-word-api.herokuapp.com",
        descriptionMoreURL: "google.com",
        checkpoint: editor.getBuffer().createCheckpoint()
      }
    });
  }

  onDidInsertSuggestion(params : SuggestionInsertedEvent): void {
    console.log("onDidInsertSuggestion", params)
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
