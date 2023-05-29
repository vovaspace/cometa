import { CoreModel } from "./Core.model";
import { relay } from "@cometa/react";

export const [CoreToken, withCore] = relay<CoreModel>({ key: "core" });
