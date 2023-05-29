import { MovieModel, MovieToken } from "../../modules/Movie";
import { effect, factory, store, Store } from "@cometa/core";
import { link } from "@cometa/core/link";
import { connect } from "@cometa/react";

export interface MovieCardModel {
	name: Store<string>;
}

export interface MovieCardModelInput {
	id: string;
	movie: MovieModel;
}

export const createMovieCardModel = factory<
	MovieCardModel,
	MovieCardModelInput
>(async ({ id, movie }) => {
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
});

export const [useMovieCardModel, withMovieCardModel] = connect<
	MovieCardModel,
	MovieCardModelInput,
	Pick<MovieCardModelInput, "id">
>(createMovieCardModel, {
	key: (props) => `movie-card/${props.id}`,
	input: (props) => ({ id: props.id, movie: MovieToken }),
	effecting: true,
});
