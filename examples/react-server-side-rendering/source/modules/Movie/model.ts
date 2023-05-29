import { effect, Effect, factory, stream, Stream } from "@cometa/core";

export interface MovieModel {
	getMovieFX: Effect<string, string>;
	isLoading: Stream<boolean>;
}

export const createMovieModel = factory<MovieModel>(() => {
	console.log("Movie Service created");

	const getMovieFX = effect<string, string>(
		(id) =>
			new Promise<string>((resolve) => {
				setTimeout(
					() => {
						resolve(`Name of ${id}`);
					},
					id.startsWith("2") ? 5000 : 2000,
				);
			}),
	);

	const isLoading = stream<boolean>((ctrl) => ctrl.spy(getMovieFX.inFlight) > 0);

	return {
		getMovieFX,
		isLoading,
	};
});
