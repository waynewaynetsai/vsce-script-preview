import { SpawnOptions } from 'child_process';
import { inject, provide } from 'injection';
import * as vscode from 'vscode';
import * as packageJSON from '../package.json';
import { completionRegisterFactory, execCmd, execShell, invokeCommands, runMacro, spawnShell, type, typeKeys } from './command';
import { createNewFile, createNewFolder, getCharAt, getCharUnderCursor, getCursorPosition, getFirstCharOnLine, getSelectedText, setCursorPosition, switchToInsertModeSelection } from './editor';
import { Instance } from './instance';
import { confirm, dropdown, input } from './interactive';
import { commandQuickpick } from './registry';
import { CommandRegistry } from './registry/registry';

@provide()
export class Library {

    @inject(Instance.ExtensionContext)
    public context: vscode.ExtensionContext;

    @inject(Instance.CommandRegistry)
    private registry: CommandRegistry;

    public version: string = packageJSON.version;

    getLatestLib(context: vscode.ExtensionContext) {
        const registerCompletionProvider = completionRegisterFactory(context);
        const lib = {
            vim: {
                switchToInsertModeSelection,
                runMacro,
                type,
                typeKeys
            },
            command: {
                registerCommand: (commandId: string, handler: (...args) => any) => this.registry.registerCommand(commandId, handler),
                invokeCommands,
                execShell,
                spawnShell,
                execCmd,
            },
            promise: {
                execShell: async (cmd: string) => execShell(cmd),
                spawnShell: async (...args: [cmd: string, args?: string[] | undefined, option?: SpawnOptions | undefined]) => spawnShell.apply(null, args),
                execCmd: async (payload: string | { command: string; args: object; }) => execCmd(payload) 
            },
            editor: {
                registerCompletionProvider,
                getFirstCharOnLine,
                getCharAt,
                getSelectedText,
                getCharUnderCursor,
                createNewFile,
                createNewFolder,
                getCursorPosition,
                setCursorPosition
            },
            interactive: {
               confirm, 
               input,
               dropdown,
               commandQuickpick
            }
        };
        return lib;
    }
}