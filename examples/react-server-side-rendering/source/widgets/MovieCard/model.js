import { effect, model, store } from "@cometa/core";
import { link } from "@cometa/core/link";
import { connect } from "@cometa/react";
import { MovieToken } from "../../modules/Movie";
export const createMovieCardModel = model(async ({ id, movie }) => {
    const name = store("");
    const getMovieFX = effect(movie.getMovieFX);
    link({
        clock: { subject: getMovieFX.resulted },
        target: name,
    });
    await getMovieFX(id);
    return {
        name,
    };
});
export const [useMovieCardModel, withMovieCardModel] = connect(createMovieCardModel, {
    key: (props) => `movie-card/${props.id}`,
    dependencies: (props) => ({ id: props.id, movie: MovieToken }),
    pure: false,
});
