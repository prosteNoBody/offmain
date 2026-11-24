import { expect, test } from 'vitest';
import { connect } from '../../src/runtime/index.js';
import { serve } from '../../src/runtime/worker.js';
import type { Tasks } from '../../src/runtime/worker.js';

function link(tasks: Tasks) {
	const { port1, port2 } = new MessageChannel();
	// a port delivers nothing to addEventListener listeners until it is started
	port1.start();
	port2.start();
	serve(port2, tasks);
	return connect(port1);
}

test('a call resolves with the value the task returns', async () => {
	const run = link({ add: (a: number, b: number) => a + b });

	expect(await run('add', [2, 3])).toBe(5);
});

test('an async task is awaited', async () => {
	const run = link({ double: (n: number) => Promise.resolve(n * 2) });

	expect(await run('double', [21])).toBe(42);
});

test('an error thrown by the task rejects the call with its name and message', async () => {
	const run = link({
		fail: () => {
			throw new RangeError('out of range');
		},
	});

	await expect(run('fail', [])).rejects.toMatchObject({
		name: 'RangeError',
		message: 'out of range',
	});
});

test('an argument that cannot be cloned rejects the call', async () => {
	const run = link({ id: (value: unknown) => value });

	await expect(run('id', [() => 1])).rejects.toMatchObject({
		name: 'DataCloneError',
	});
});

test('a return value that cannot be cloned rejects the call', async () => {
	const run = link({ makeFunction: () => () => 1 });

	await expect(run('makeFunction', [])).rejects.toMatchObject({
		name: 'DataCloneError',
	});
});

test('overlapping calls get their own results when replies come out of order', async () => {
	const finished: string[] = [];
	const run = link({
		wait: async (ms: number, label: string) => {
			await new Promise((resolve) => setTimeout(resolve, ms));
			finished.push(label);
			return label;
		},
	});

	const results = await Promise.all([run('wait', [40, 'slow']), run('wait', [0, 'fast'])]);

	expect(finished).toEqual(['fast', 'slow']);
	expect(results).toEqual(['slow', 'fast']);
});

test('a call to a task that does not exist is rejected', async () => {
	const run = link({});

	await expect(run('missing', [])).rejects.toMatchObject({
		name: 'OffmainError',
		message: 'unknown task missing',
	});
});
