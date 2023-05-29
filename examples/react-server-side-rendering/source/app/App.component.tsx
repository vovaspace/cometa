import { Movie } from "../widgets/MovieCard";
import { Meta } from "./components";
import { Suspense, useState } from "react";

export const AppComponent = () => {
	const [shown, setShown] = useState(true);

	return (
		<html>
			<head />
			<body>
				<h1>Hello!</h1>
				<button type="button" onClick={() => setShown((current) => !current)}>
					Hide/Show
				</button>
				<Meta />
				{shown && (
					<>
						<Suspense fallback="Loading...">
							<Movie id="4442" />
						</Suspense>
						<Suspense fallback="Loading...">
							<Movie id="2242" />
						</Suspense>
					</>
				)}
			</body>
		</html>
	);
};
