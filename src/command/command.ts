import * as vscode from 'vscode';
import { CommandPayload } from '../models';
import * as cp from 'child_process';

export function commandRegisterFactory(context: vscode.ExtensionContext) {
	const registerCommand = (commandId: string, commandHandler: (...args: any[]) => any) => {
		const subscription = vscode.commands.registerCommand(commandId, commandHandler);
		context.subscriptions.push(subscription);
	};
	const registerTextEditorCommand = (commandId: string, commandHandler: (...args: any[]) => any) => {
		const subscription = vscode.commands.registerCommand(commandId, commandHandler);
		context.subscriptions.push(subscription);
	};
	return [registerCommand, registerTextEditorCommand];
}

export function type(typeText: string): () => Thenable<void> {
	return () => vscode.commands.executeCommand("type", { text: typeText });
}

type CommandFactory<T = any> = () => Thenable<T>;

export function invokeCommands(commands: CommandFactory[]) {
	return commands.reduce((acc, curr) => acc.then(_ => curr()), Promise.resolve(null) as Thenable<null>);
}


export function execCmd<T = unknown>(cmd: string | { command: string; args: object }): () => Thenable<T> {
	if (typeof cmd === 'string') {
		return () => vscode.commands.executeCommand(cmd);
	} else if (cmd.command && typeof cmd.command === 'string') {
		return () => vscode.commands.executeCommand(cmd.command, cmd.args);
	} else {
		const msg = `Provide wrong command payload: ${cmd}`;
		vscode.window.showErrorMessage(msg);
		throw new Error(msg);
	}
}

export function insertSnippet(snippet: string) {
	return () => execCmd({
		command: "insertSnippet",
		args: { snippet }
	});
}

export function typeCommands(texts: string[]): (() => Thenable<void>)[] {
	return texts.map(t => type(t));
}

export const runMacro = (cmds: string[]) => invokeCommands(typeCommands(cmds));

export function execShell(cmd: string) {
	return new Promise((resolve, reject) => {
		cp.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				console.error(stderr);
				reject(err);
			}
			resolve(stdout);
		});
	});
}
