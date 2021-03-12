import { SpawnOptions } from 'child_process';
import { inject, provide } from 'injection';
import * as vscode from 'vscode';
import * as packageJSON from '../package.json';
import { completionRegisterFactory, execCmd, execShell, invokeCommands, runAutomation, runCommands, runMacro, spawnShell, type, typeCharUnderCursor, typeKeys, writeText } from './command';
import { copyFileOrFolder, createNewFile, createNewFolder, findFirstOccurCharAboveCursor, findFirstOccurCharAtLine, getCharAt, getCharUnderCursor, getCurrentLine, getCurrentWorkspaceFolder, getCursorPosition, getFirstCharOnLine, getLine, getSelectedText, setCursorPosition, switchToInsertModeSelection } from './editor'; import { Instance } from './instance';
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

    getLatestLib(context: vscode.ExtensionContext)  {
        const registerCompletionProvider = completionRegisterFactory(context);
        const lib = {
            version: this.version,
            automation: {
                type,
                typeKeys,
                typeCharUnderCursor,
                writeText,
                execCmd,
                execShell,
                spawnShell,
                runMacro,
                runCommands,
                runAutomation,
            },
            commands: {
                registerCommand: (commandId: string, handler: (...args: any) => any) => this.registry.registerScriptCommand(commandId, handler),
                invokeCommands
            },
            promise: {
                execCmd: (payload: string | { command: string; args: object; }) => execCmd(payload)(),
                execShell: (cmd: string) => execShell(cmd)(),
                spawnShell: (...args: [cmd: string, args?: string[] | undefined, option?: SpawnOptions | undefined]) => spawnShell.apply(null, args)(),
                typeCharUnderCursor: () => typeCharUnderCursor(),
                type: (text: string) => type(text)(),
                typeKeys: (texts: string[]) => typeKeys(texts)(),
                writeText: (text: string) => writeText(text)()
            },
            editor: {
                registerCompletionProvider,
                getFirstCharOnLine,
                getLine,
                getCurrentLine,
                getCharAt,
                getSelectedText,
                getCharUnderCursor,
                findFirstOccurCharAtLine,
                findFirstOccurCharAboveCursor,
                getCursorPosition,
                setCursorPosition
            },
            fs: {
                getCurrentWorkspaceFolder,
                copyFileOrFolder,
                createNewFile,
                createNewFolder
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