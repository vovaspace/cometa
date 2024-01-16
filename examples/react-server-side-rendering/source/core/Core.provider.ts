import { relay } from "@cometa/react";

import { CoreModel } from "./Core.model";

export const [CoreToken, CoreProvider] = relay<CoreModel>({ key: "core" });
