'use babel';

import { CompletionProvider } from "./completion-provider"

const PROVIDER = new CompletionProvider();
export default {
    getProvider() {
      console.log("get providers")
      console.log(PROVIDER);
      return PROVIDER;
    }
};
