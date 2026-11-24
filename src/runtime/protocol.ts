export interface Endpoint {
	postMessage(message: unknown): void;
	addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
}

export interface Call {
	id: number;
	task: string;
	args: unknown[];
}

export type Reply =
	| { id: number; ok: true; value: unknown }
	| { id: number; ok: false; error: { name: string; message: string } };

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function isCall(value: unknown): value is Call {
	if (!isObject(value)) {
		return false;
	}

	return (
		typeof value.id === 'number' && typeof value.task === 'string' && Array.isArray(value.args)
	);
}

export function isReply(value: unknown): value is Reply {
	if (!isObject(value) || typeof value.id !== 'number') {
		return false;
	}

	if (value.ok === true) {
		return true;
	}

	if (value.ok !== false || !isObject(value.error)) {
		return false;
	}

	return typeof value.error.name === 'string' && typeof value.error.message === 'string';
}
