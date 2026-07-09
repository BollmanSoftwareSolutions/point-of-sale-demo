// MSW browser worker setup.
// See design-docs/04-api-contract.md (MSW Implementation Notes).

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
