import { OffmainError } from './error.js';
import { isCall } from './protocol.js';
import type { Call, Endpoint, Reply } from './protocol.js';

export type { Endpoint } from './protocol.js';

export type Tasks = Record<string, (...args: never[]) => unknown>;

type Task = (...args: unknown[]) => unknown;

export function serve(endpoint: Endpoint, tasks: Tasks) {
	async function answer(call: Call) {
		try {
			const task = tasks[call.task] as Task | undefined;

			if (!task) {
				throw new OffmainError(`unknown task ${call.task}`);
			}

			const value = await task(...call.args);

			// stays inside try: a result that cannot be cloned makes postMessage
			// throw, and the caller has to hear about it as a failed call
			endpoint.postMessage({ id: call.id, ok: true, value } satisfies Reply);
		} catch (thrown) {
			const error = thrown instanceof Error ? thrown : new Error(String(thrown));

			endpoint.postMessage({
				id: call.id,
				ok: false,
				error: { name: error.name, message: error.message },
			} satisfies Reply);
		}
	}

	endpoint.addEventListener('message', (event) => {
		const data: unknown = event.data;

		if (__OFFMAIN_DEV__ && !isCall(data)) {
			throw new OffmainError(`expected a call, got ${JSON.stringify(data)}`);
		}

		void answer(data as Call);
	});
}
