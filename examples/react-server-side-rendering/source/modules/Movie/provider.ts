import { createMovieModel } from "./model";
import { provide } from "@cometa/react";

export const [MovieToken, withMovie] = provide(createMovieModel, {
	key: "movie",
});
