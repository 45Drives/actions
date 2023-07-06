import * as core from '@actions/core';

import fs from 'fs';

import { v4 as uuidV4 } from 'uuid';

async function run(): Promise<void> {
	try {
		const manifestPath = core.getInput('path');

		const content = fs.readFileSync(manifestPath);

		const json = JSON.parse(content.toString());

		core.setOutput('json', json);
		core.setOutput('matrix', { include: json.builds });
		core.setOutput('uuid', uuidV4());
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message);
	}
}

run();
