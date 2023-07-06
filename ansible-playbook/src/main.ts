import * as core from '@actions/core';
import * as exec from '@actions/exec';

import fs from 'fs';

import { tmpFile } from './tmp';
import path from 'path';

async function run(): Promise<void> {
	const tmpFiles = [];

	try {
		const ansibleBin = core.getInput('ansible_bin');
		const playbook = core.getInput('playbook', { required: true });

		// const requirements = core.getInput('requirements');
		// const requirementsFile = core.getInput('requirements_file');

		const directory = core.getInput('directory');

		const user = core.getInput('user');

		const unbufferedOutput = core.getBooleanInput('unbuffered_output');

		const limit = core.getInput('limit');
		const startAtTask = core.getInput('start_task');

		const skipTags = core.getInput('skip_tags');
		const tags = core.getInput('tags');

		const privateKey = core.getInput('private_key');
		const privateKeyFile = core.getInput('private_key_file');

		const inventory = core.getInput('inventory');
		const inventoryFile = core.getInput('inventory_file');

		const vaultPassword = core.getInput('vault_password');
		const vaultPasswordFile = core.getInput('vault_password_file');

		const knownHosts = core.getInput('known_hosts');
		const knownHostsFile = core.getInput('known_hosts_file');

		const become = core.getBooleanInput('become');
		const becomeUser = core.getInput('become_user');

		const becomePassword = core.getInput('become_password');
		const becomePasswordFile = core.getInput('become_password_file');

		const connectionPassword = core.getInput('connection_password');
		const connectionPasswordFile = core.getInput('connection_password_file');

		const forks = core.getInput('forks');

		const hostKeyChecking = core.getBooleanInput('host_key_checking');

		const noColor = core.getBooleanInput('no_color');

		const cmd: string[] = [];
		const env: { [key: string]: string } = {};
		const sshCommonArgs = [];

		cmd.push(playbook);

		if (forks) {
			try {
				const forksNumber = Math.max(parseInt(forks), 0);

				cmd.push('--forks', forksNumber.toString());
			} catch (error) {
				throw error;
			}
		}

		if (inventory) {
			const tmpInventoryPath = !directory ? tmpFile('_ansible_hosts') : path.join(directory, '_ansible_hosts');

			fs.writeFileSync(tmpInventoryPath, inventory);

			cmd.push('--inventory-file', tmpInventoryPath);

			tmpFiles.push(tmpInventoryPath);
		}

		if (inventoryFile) {
			if (!fs.existsSync(inventoryFile)) {
				throw new Error('The inventory file specified does not exist.');
			}

			cmd.push('--inventory-file', inventoryFile);
		}

		if (privateKey) {
			const tmpPrivateKeyPath = tmpFile('_ansible_ssh_private_key');

			fs.writeFileSync(tmpPrivateKeyPath, privateKey);

			cmd.push('--private-key', tmpPrivateKeyPath);

			tmpFiles.push(tmpPrivateKeyPath);
		}

		if (privateKeyFile) {
			if (!fs.existsSync(privateKeyFile)) {
				throw new Error('The private key file specified does not exist.');
			}

			cmd.push('--private-key', privateKeyFile);
		}

		if (vaultPassword) {
			const tmpVaultPasswordPath = tmpFile('_ansible_vault_password');

			fs.writeFileSync(tmpVaultPasswordPath, vaultPassword);

			cmd.push('--vault-password-file', tmpVaultPasswordPath);

			tmpFiles.push(tmpVaultPasswordPath);
		}

		if (vaultPasswordFile) {
			if (!fs.existsSync(vaultPasswordFile)) {
				throw new Error('The vault password file specified does not exist.');
			}

			cmd.push('--vault-password-file', vaultPasswordFile);
		}

		if (limit) {
			cmd.push('--limit', limit);
		}

		if (startAtTask) {
			cmd.push('--start-at-task', startAtTask);
		}

		if (tags) {
			cmd.push('--tags', tags);
		}

		if (skipTags) {
			cmd.push('--skip-tags', skipTags);
		}

		if (user) {
			cmd.push('--user', user);
		}

		if (connectionPassword) {
			const tmpConnectionPasswordPath = tmpFile('_ansible_connection_password');

			fs.writeFileSync(tmpConnectionPasswordPath, vaultPassword);

			cmd.push('--connection-password-file', tmpConnectionPasswordPath);

			tmpFiles.push(tmpConnectionPasswordPath);
		}

		if (connectionPasswordFile) {
			if (!fs.existsSync(connectionPasswordFile)) {
				throw new Error('The connection password file specified does not exist.');
			}

			cmd.push('--connection-password-file', connectionPasswordFile);
		}

		if (becomePassword) {
			const tmpBecomePasswordPath = tmpFile('_ansible_become_password');

			fs.writeFileSync(tmpBecomePasswordPath, vaultPassword);

			cmd.push('--become-password-file', tmpBecomePasswordPath);

			tmpFiles.push(tmpBecomePasswordPath);
		}

		if (becomePasswordFile) {
			if (!fs.existsSync(becomePasswordFile)) {
				throw new Error('The become password file specified does not exist.');
			}

			cmd.push('--become-password-file', becomePasswordFile);
		}

		if (become) {
			cmd.push('--become');
		}

		if (becomeUser) {
			cmd.push('--become-user', becomeUser);
		}

		if (knownHosts) {
			const tmpKnownHostsPath = tmpFile('_ansible_known_hosts');

			fs.writeFileSync(tmpKnownHostsPath, knownHosts);

			sshCommonArgs.push('-o', `UserKnownHostsFile=${tmpKnownHostsPath}`);

			tmpFiles.push(tmpKnownHostsPath);
		}

		if (knownHostsFile) {
			if (!fs.existsSync(vaultPasswordFile)) {
				throw new Error('The inventory file specified does not exist.');
			}

			sshCommonArgs.push('-o', `UserKnownHostsFile=${knownHostsFile}`);
		}

		if (!hostKeyChecking) {
			sshCommonArgs.push('-o', 'StrictHostKeyChecking=no');
			env['ANSIBLE_HOST_KEY_CHECKING'] = 'False';
		} else {
			sshCommonArgs.push('-o', 'StrictHostKeyChecking=yes');
			env['ANSIBLE_HOST_KEY_CHECKING'] = 'True';
		}

		if (noColor) {
			env['ANSIBLE_NOCOLOR'] = 'True';
		} else {
			env['ANSIBLE_FORCE_COLOR'] = 'True';
		}

		if (unbufferedOutput) {
			env['PYTHONUNBUFFERED'] = '1';
		}

		cmd.push('--ssh-common-args', sshCommonArgs.join(' '));

		// if (requirements)
		// if (requirementsFile)
		// ansible-galaxy install -r $reqs

		// chdir

		// const output = [];

		const exitCode = await exec.exec(ansibleBin || 'ansible-playbook', cmd, {
			cwd: directory,
			env,
			listeners: {
				// stdout: stdout => {
				// 	// core.info(stdout.toString());
				// 	// console.log(stdout);
				// 	// output.push(stdout);
				// },
				// stderr: stderr => {
				// 	// core.error(stderr.toString());
				// 	// console.error(stderr);
				// 	// output.push(stderr);
				// },
			},
		});

		if (exitCode !== 0) {
			throw new Error(`${ansibleBin || 'ansible-playbook'} run failed!`);
		}
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message);
	} finally {
		for (const file of tmpFiles) {
			await fs.promises.unlink(file);
		}
	}
}

run();
