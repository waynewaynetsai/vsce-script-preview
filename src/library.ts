import * as vscode from 'vscode';
import * as packageJSON from '../package.json';
import { commandRegisterFactory, completionRegisterFactory, execCmd, execShell, invokeCommands, runMacro, type } from './command';
import { createNewFile, createNewFolder, getCharAt, getCharUnderCursor, getCursorPosition, getFirstCharOnLine, getSelectedText, setCursorPosition, switchToInsertModeSelection } from './editor';
import { CommandRegistry } from './registry/registry';

export class Library {
  version: string = packageJSON.version;

  constructor(public context: vscode.ExtensionContext, private registry: CommandRegistry) {}
  
  getLatestLib(context: vscode.ExtensionContext) {
      const registerCompletionProvider = completionRegisterFactory(context);
      const lib = {
          vim: {
              switchToInsertModeSelection,
              runMacro,
              type
          },
          commands: {
              registerCommand: (commandId: string, handler: (...args) => any ) => this.registry.registerCommand(commandId, handler),
              invokeCommands,
              execShell,
              execCmd
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
          }
      };
      return lib;
  } 
}