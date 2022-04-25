import * as vscode from 'vscode';
import { SpawnOptions } from "child_process";

export interface QuickpickSetting {
	title: string;
	default?: string;
	items: QuickpickCommandItem[]
}

export interface QuickpickCommandItem extends vscode.QuickPickItem {
	label: string;
	command: string;
	args?: any;
}

export interface LibraryApi {
  version: string;
  automation: {
    operation: {
      typeCharUnderCursor: () => () => Thenable<void>;
      type: (typeText: string) => () => Thenable<void>;
      typeKeys: (typeTexts: string[]) => () => Thenable<void>;
      execShell: (cmd: string) => () => Thenable<void>;
      spawnShell: (
        cmd: string,
        args?: string[],
        option?: SpawnOptions
      ) => () => Thenable<void>;
      execCmd: <T = unknown>(
        cmd: string | { command: string; args: object }
      ) => () => Thenable<T>;
      setCursorPosition: (pos: vscode.Position) => () => Promise<any>;
      switchToInsertModeSelection: () => Promise<void>;
    };
    runner: {
      invokeCommands: (...args: any[]) => Thenable<null>;
      runMacro: (cmds: string[]) => Thenable<null>;
    };
  };
  commands: {
    registerCommand: (
      commandId: string,
      handler: (...args: any) => any
    ) => void;
  };
  promise: {
    execShell: (cmd: string) => () => Thenable<void>;
    spawnShell: (
      cmd: string,
      args?: string[] | undefined,
      option?: SpawnOptions | undefined
    ) => () => Thenable<void>;
    execCmd: (
      payload: string | { command: string; args: object }
    ) => () => Thenable<unknown>;
    typeCharUnderCursor: () => () => Thenable<void>;
    type: (text: string) => Thenable<void>;
    typeKeys: (texts: string[]) => () => Thenable<void>;
  };
  editor: {
    registerCompletionProvider: (
      selector: vscode.DocumentSelector,
      completionItemProvider: vscode.CompletionItemProvider<vscode.CompletionItem>,
      ...triggerCommitCharacters: string[]
    ) => void;
    getFirstCharOnLine: (
      document: vscode.TextDocument,
      line: number
    ) => vscode.Position;
    getLine: (lineNumber: number) => string | undefined;
    getCurrentLine: (editor: vscode.TextEditor) => string;
    getCharAt: (
      document: vscode.TextDocument,
      position: vscode.Position
    ) => string;
    getSelectedText: () => string | undefined;
    getCharUnderCursor: () => string | undefined;
    findFirstOccurCharAtLine: (
      chars: string[],
      line: number,
      start: number
    ) => string | undefined;
    findFirstOccurCharAboveCursor: (chars: string[]) => string | undefined;
    createNewFile: (
      filename: string,
      content: string,
      fsPath?: string | undefined
    ) => Thenable<void> | undefined;
    createNewFolder: (
      name: string,
      fsPath?: string | undefined
    ) => Thenable<void> | undefined;
    getCursorPosition: () => vscode.Position | undefined;
    setCursorPosition: (pos: vscode.Position) => () => Promise<any>;
  };
  interactive: {
    confirm: (
      title: string,
      placeHolder?: "Yes" | "No",
      options?: vscode.QuickPickOptions
    ) => Promise<boolean>;
    input: (
      prompt: string,
      placeHolder: string,
      options?: vscode.InputBoxOptions
    ) => Promise<string>;
    dropdown: (
      title: string,
      items: string[],
      placeHolder: string,
      options?: vscode.QuickPickOptions
    ) => Promise<string | undefined>;
    commandQuickpick: (
      setting: QuickpickSetting
    ) => Promise<void>;
  };
}
