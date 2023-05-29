export const enum ResourceStatus {
	Initial,
	Pending,
	Resolved,
	Rejected,
}

interface InitialResource {
	status: ResourceStatus.Initial;
}

interface PendingResource<T> {
	status: ResourceStatus.Pending;
	promise: Promise<ResolvedResource<T> | RejectedResource>;
}

interface ResolvedResource<T> {
	status: ResourceStatus.Resolved;
	result: T;
}

interface RejectedResource {
	status: ResourceStatus.Rejected;
	error: unknown;
}

export type Resource<T> = {
	current:
		| InitialResource
		| PendingResource<T>
		| ResolvedResource<T>
		| RejectedResource;
	resolve: () => PendingResource<T> | ResolvedResource<T> | RejectedResource;
	reset: () => void;
};

export function createResource<T>(creator: () => Promise<T> | T): Resource<T> {
	const resource: Resource<T> = {
		current: { status: ResourceStatus.Initial },
		resolve() {
			if (resource.current.status !== ResourceStatus.Initial)
				return resource.current;

			const instance = creator();
			resource.current =
				instance instanceof Promise
					? {
							status: ResourceStatus.Pending,
							promise: instance
								.then(
									(result) =>
										(resource.current = {
											status: ResourceStatus.Resolved,
											result,
										}),
								)
								.catch(
									(error) =>
										(resource.current = {
											status: ResourceStatus.Rejected,
											error,
										}),
								),
					  }
					: {
							status: ResourceStatus.Resolved,
							result: instance,
					  };

			return resource.current;
		},
		reset() {
			resource.current = { status: ResourceStatus.Initial };
		},
	};

	return resource;
}

export function useResource<T>(resource: Resource<T>): T {
	const resolved = resource.resolve();

	if (resolved.status === ResourceStatus.Pending) throw resolved.promise;
	if (resolved.status === ResourceStatus.Rejected) throw resolved.error;

	return resolved.result;
}
