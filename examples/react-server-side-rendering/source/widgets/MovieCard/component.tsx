import { useMovieCardModel } from "./model";
import { useSource } from "@cometa/react";
import { FC } from "react";

export const MovieComponent: FC = () => {
	const model = useMovieCardModel();
	const name = useSource(model.name);

	return (
		<article>
			<h2>Movie {name}</h2>
		</article>
	);
};
