import { effect, model, store, Store } from "@cometa/core";
import { link } from "@cometa/core/link";
import { connect } from "@cometa/react";

import { MovieModel, MovieToken } from "../../modules/Movie";

export interface MovieCardModel {
	name: Store<string>;
}

export interface MovieCardModelInput {
	id: string;
	movie: MovieModel;
}

export const createMovieCardModel = model<MovieCardModel, MovieCardModelInput>(
	async ({ id, movie }) => {
		const name = store("");

		const getMovieFX = effect<string, string>(movie.getMovieFX);

		link({
			clock: { subject: getMovieFX.resulted },
			target: name,
		});

		await getMovieFX(id);

		return {
			name,
		};
	},
);

export const [useMovieCardModel, withMovieCardModel] = connect<
	MovieCardModel,
	Pick<MovieCardModelInput, "id">,
	MovieCardModelInput
>(createMovieCardModel, {
	key: (props) => `movie-card/${props.id}`,
	dependencies: (props) => ({ id: props.id, movie: MovieToken }),
	pure: false,
});
