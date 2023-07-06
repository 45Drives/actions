import crypto from 'crypto';
import os from 'os';
import path from 'path';

export function tmpFile(suffix: string, tmpdir?: string) {
	const prefix = 'tmp.';

	tmpdir = tmpdir ? tmpdir : os.tmpdir();

	return path.join(tmpdir, prefix + crypto.randomBytes(16).toString('hex') + suffix);
}
