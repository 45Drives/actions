import { tmpFile } from '../src/tmp';

import { expect, test } from '@jest/globals';

test('suffix appends to end', async () => {
	const tmpFileName = tmpFile('_test');

	expect(tmpFileName.endsWith('_test'));
});

test('tmp path prefix', async () => {
	const tmpFileName = tmpFile('_test', '/tmp');

	expect(tmpFileName.startsWith('/tmp/tmp.'));
});
