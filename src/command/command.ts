import * as vsc from 'vscode';
import * as cp from 'child_process';
import { logger } from '../logger';

export function commandRegisterFactory(context: vsc.ExtensionContext) {
	const registerCommand = (commandId: string, commandHandler: (...args: any[]) => any) => {
		const subscription = vsc.commands.registerCommand(commandId, commandHandler);
		logger.debug(`registerCommand:${commandId}`);
		context.subscriptions.push(subscription);
	};
	const registerTextEditorCommand = (commandId: string, commandHandler: (...args: any[]) => any) => {
		const subscription = vsc.commands.registerCommand(commandId, commandHandler);
		logger.debug(`registerTextEditorCommand:${commandId}`);
		context.subscriptions.push(subscription);
	};
	return [registerCommand, registerTextEditorCommand];
}

export function completionRegisterFactory(context: vsc.ExtensionContext) {
	const registerCompletionItemProvider = (selector: vsc.DocumentSelector, completionItemProvider: vsc.CompletionItemProvider, triggerCharacters = []) => {
		const subscription = vsc.languages.registerCompletionItemProvider(selector, completionItemProvider);
		context.subscriptions.push(subscription);
	};
	return registerCompletionItemProvider;
}

export function execCmd<T = unknown>(cmd: string | { command: string; args: object }): () => Thenable<T> {
	if (typeof cmd === 'string') {
		return () => {
			logger.info(`Execute VSCodeCommand: ${cmd}`);
			return vsc.commands.executeCommand(cmd);
		};
	} else if (cmd.command && typeof cmd.command === 'string') {
		return () => {
			logger.info(`Execute VSCodeCommand: ${cmd.command}, args: ${cmd.args}`);
			return vsc.commands.executeCommand(cmd.command, cmd.args);
		};
	} else {
		const msg = `Provide wrong command payload: ${cmd}`;
		vsc.window.showErrorMessage(msg);
		throw new Error(msg);
	}
}

export function insertSnippet(snippet: string) {
	return () => execCmd({
		command: "insertSnippet",
		args: { snippet }
	});
}

/**
 * Exec a shell command
 */
export function execShell(cmd: string) {
	return () => vsc.window.withProgress({ location: vsc.ProgressLocation.Notification }, async (progress) => {
		progress.report({
			message: `Execute shell command: ${cmd}...`,
		});
		await new Promise((resolve, reject) => {
			cp.exec(cmd, (err, stdout, stderr) => {
				if (err) {
					console.error(stderr);
					logger.error(`${err}`);
					reject(err);
				}
				logger.info(stdout.toString());
				resolve(stdout);
			});
		});
	});
}

/**
 * Spawn a shell command with progress and logs
 */
export function spawnShell(cmd: string, args: string[] = [], option: cp.SpawnOptions = {}) {
	return () => vsc.window.withProgress({ location: vsc.ProgressLocation.Notification }, async (progress) => {
		progress.report({
			message: `Execute shell command: ${cmd}...`,
		});
		await new Promise((resolve, reject) => {
			const proc = cp.spawn(cmd, args, option);

			logger.info(`\n$ ${cmd} ${args.join(' ')}\n`);
			logger.info(`Spawn option: ${JSON.stringify(option)}`);

			proc.stdout?.on('data', (data) => {
				logger.info(data.toString());
			});

			proc.stderr?.on('data', (data) => {
				logger.error(data.toString());
			});

			proc.on('close', (code) => {
				logger.info(`> ${cmd} exited with code ${code?.toString()}`);
				resolve(null);
			});

			proc.on('error', (err) => {
				logger.info(`> ${cmd} exited with error ${err.toString()}`);
				reject(err);
			});
		});
	});
}