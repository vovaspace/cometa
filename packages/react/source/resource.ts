export enum ResourceStatus {
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
	instance: T;
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
	obsolete: boolean;
	resolve: () => PendingResource<T> | ResolvedResource<T> | RejectedResource;
	cleanup: () => void;
};

export function createResource<T>(
	builder: () => Promise<T> | T,
	cleanup: (instance: T) => void,
): Resource<T> {
	const resource: Resource<T> = {
		current: { status: ResourceStatus.Initial },
		obsolete: false,
		resolve() {
			resource.obsolete = false;

			if (resource.current.status !== ResourceStatus.Initial)
				return resource.current;

			const instance = builder();
			resource.current =
				instance instanceof Promise
					? {
							status: ResourceStatus.Pending,
							promise: instance
								.then(
									(instance) =>
										(resource.current = {
											status: ResourceStatus.Resolved,
											instance,
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
							instance,
					  };

			return resource.current;
		},
		cleanup() {
			const status = resource.current.status;
			if (status === ResourceStatus.Pending) {
				resource.obsolete = true;
				resource.current.promise.then(
					() => resource.obsolete && resource.cleanup(),
				);
			} else {
				if (status === ResourceStatus.Resolved) cleanup(resource.current.instance);
				resource.current = { status: ResourceStatus.Initial };
			}
		},
	};

	return resource;
}

export function useResource<T>(resource: Resource<T>): T {
	const resolved = resource.resolve();

	if (resolved.status === ResourceStatus.Pending) throw resolved.promise;
	if (resolved.status === ResourceStatus.Rejected) throw resolved.error;

	return resolved.instance;
}
