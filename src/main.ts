'use babel';

import { CompletionProvider } from "./completion-provider"

const PROVIDER = new CompletionProvider();
export default {
    getProvider() {
      return PROVIDER;
    }
};
