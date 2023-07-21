import * as core from '@actions/core';
import * as exec from '@actions/exec';

import fs from 'fs';
import path from 'path';

// import { tmpFile } from './tmp';
// import path from 'path';

// const parseInputFiles = (files: string): string[] => {
// 	return files.split(/\r?\n/).reduce<string[]>(
// 		(acc, line) =>
// 			acc
// 				.concat(line.split(','))
// 				.filter(pat => pat)
// 				.map(pat => pat.trim()),
// 		[],
// 	);
// };

async function run(): Promise<void> {
	const tmpFiles: string[] = [];

	try {
		const manifestJson = core.getInput('manifest');
		const buildJson = core.getInput('build');
		const uuid = core.getInput('uuid');

		const manifest = JSON.parse(manifestJson);
		const build = JSON.parse(buildJson);

		const buildId = build.id ? build.id : build.os_name;

		if (['rocky'].includes(build.group)) {
			const cmd: string[] = [];

			cmd.push('run', '-t', '--rm');

			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/input/${buildId}/specs:/home/rpm/rpmbuild/SPECS`);
			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/input/${buildId}/sources:/home/rpm/rpmbuild/SOURCES`);
			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/output/${buildId}/rpms:/home/rpm/rpmbuild/RPMS`);
			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/output/${buildId}/srpms:/home/rpm/rpmbuild/SRPMS`);

			cmd.push('-e', 'NPM_TOKEN=?');
			cmd.push('-e', `SPEC_NAME=${manifest.name}`);

			cmd.push(build.image);

			const exitCode = await exec.exec('podman', cmd);

			if (exitCode !== 0) {
				throw new Error(`rocky build failed!`);
			}
		}

		if (['debian', 'ubuntu'].includes(build.group)) {
			const cmd: string[] = [];

			cmd.push('run', '-t', '--rm');

			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/input/${buildId}/source:/home/deb/build`);
			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/input/${buildId}/debian:/home/deb/build/debian`);
			cmd.push('-v', `/mnt/ci_artifacts/${uuid}/output/${buildId}/debs:/home/deb/debs`);

			cmd.push('-e', 'NPM_TOKEN=?');

			cmd.push(build.image);

			const exitCode = await exec.exec('podman', cmd);

			if (exitCode !== 0) {
				throw new Error(`rocky build failed!`);
			}
		}

		fs.writeFileSync(path.join('/mnt/ci_artifacts', uuid, 'output', buildId, 'build_info.json'), JSON.stringify(build));
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message);
	} finally {
		for (const file of tmpFiles) {
			await fs.promises.unlink(file);
		}
	}
}

run();
