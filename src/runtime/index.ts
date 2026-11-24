import { OffmainError } from './error.js';
import { isReply } from './protocol.js';
import type { Call, Endpoint, Reply } from './protocol.js';

export type { Endpoint } from './protocol.js';

interface Pending {
	resolve(value: unknown): void;
	reject(reason: Error): void;
}

export function connect(endpoint: Endpoint) {
	const pending = new Map<number, Pending>();
	let nextId = 0;

	endpoint.addEventListener('message', (event) => {
		const data: unknown = event.data;

		if (__OFFMAIN_DEV__ && !isReply(data)) {
			throw new OffmainError(`expected a reply, got ${JSON.stringify(data)}`);
		}

		const reply = data as Reply;
		const waiting = pending.get(reply.id);

		if (__OFFMAIN_DEV__ && !waiting) {
			throw new OffmainError(`reply to call ${reply.id}, which is not open`);
		}

		if (!waiting) {
			return;
		}

		pending.delete(reply.id);

		if (reply.ok) {
			waiting.resolve(reply.value);
			return;
		}

		const error = new Error(reply.error.message);
		error.name = reply.error.name;

		waiting.reject(error);
	});

	function run(task: string, args: unknown[]): Promise<unknown> {
		const call: Call = { id: nextId, task, args };
		nextId += 1;

		return new Promise((resolve, reject) => {
			// postMessage throws on a value that cannot be cloned; posting first
			// lets that reject the promise without leaving an entry in pending
			endpoint.postMessage(call);

			pending.set(call.id, { resolve, reject });
		});
	}

	return run;
}
