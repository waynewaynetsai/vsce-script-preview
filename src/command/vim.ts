import * as vscode from "vscode";
import { getCharUnderCursor } from "../editor";
import { CommandFactory, TypeCommand } from "../models";

export const makeTypeCommand = (input: string): TypeCommand => {
    return {
        command: "text",
        args: {
            text: input
        }
    };
};

export function invokeCommands(...args: any[]) {
    let commands: CommandFactory[];
    if (args.length === 1 && Array.isArray(args[0])) {
        commands = args[0];    
    } else {
        commands = args;
    } 
	return commands.reduce((acc, curr) => acc.then(_ => curr()), Promise.resolve(null) as Thenable<null>);
}

export function type(typeText: string): () => Thenable<void> {
	return () => vscode.commands.executeCommand("type", { text: typeText });
}

export function typeKeys(typeTexts: string[]): () => Thenable<void> {
    return () => typeTexts.reduce((acc, curr) => acc.then(_ => type(curr)()), Promise.resolve(null) as Thenable<void>);
}

export function typeCommands(texts: string[]): (() => Thenable<void>)[] {
	return texts.map(t => type(t));
}

export const runMacro = (cmds: string[]) => invokeCommands(typeCommands(cmds));

export const typeCharUnderCursor = () =>  {
    const char = getCharUnderCursor();
    // TODO: add log for undefined char
    if (!char) return;
    return type(char);
};
