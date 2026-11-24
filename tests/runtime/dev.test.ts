import { expect, test } from 'vitest';
import { connect } from '../../src/runtime/index.js';
import type { Endpoint } from '../../src/runtime/index.js';
import { serve } from '../../src/runtime/worker.js';

type Listener = (event: MessageEvent) => void;

// Stands in for a worker so a test can hand the library any message it wants
// and see the error thrown by the listener, which a real port would swallow.
function fakeEndpoint() {
	const sent: unknown[] = [];
	let listener: Listener | undefined;

	const endpoint: Endpoint = {
		postMessage(message) {
			sent.push(message);
		},
		addEventListener(_type, added) {
			listener = added;
		},
	};

	function receive(data: unknown) {
		if (!listener) {
			throw new Error('nothing listens on the endpoint');
		}

		listener(new MessageEvent('message', { data }));
	}

	return { endpoint, sent, receive };
}

const offmainError = expect.objectContaining({ name: 'OffmainError' }) as Error;

test('the caller side refuses a message that is not a reply', () => {
	const { endpoint, receive } = fakeEndpoint();
	connect(endpoint);

	expect(() => receive('hello')).toThrow(offmainError);
	expect(() => receive({ id: 0 })).toThrow(offmainError);
	expect(() => receive({ id: 0, ok: false, error: 'broken' })).toThrow(offmainError);
});

test('the caller side refuses a reply to a call it did not make', () => {
	const { endpoint, receive } = fakeEndpoint();
	connect(endpoint);

	expect(() => receive({ id: 7, ok: true, value: 1 })).toThrow(offmainError);
});

test('the caller side refuses a second reply to the same call', async () => {
	const { endpoint, receive } = fakeEndpoint();
	const run = connect(endpoint);

	const result = run('add', [1, 2]);
	receive({ id: 0, ok: true, value: 3 });

	expect(await result).toBe(3);
	expect(() => receive({ id: 0, ok: true, value: 3 })).toThrow(offmainError);
});

test('the worker side refuses a message that is not a call', () => {
	const { endpoint, sent, receive } = fakeEndpoint();
	serve(endpoint, {});

	expect(() => receive('hello')).toThrow(offmainError);
	expect(() => receive({ id: 0, task: 'add' })).toThrow(offmainError);
	expect(() => receive({ id: '0', task: 'add', args: [] })).toThrow(offmainError);
	expect(sent).toEqual([]);
});
