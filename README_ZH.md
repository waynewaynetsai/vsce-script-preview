# Vsce-Script: an extension that helps you automate your VS Code and vim extension with javascript and typescript 

Vsce-Script is an open-source extension for Visual Studio Code and Vim Extension.

Vsce-Script provide VS Code extension's runtime, VS Code API and Library for creating smoothly operation at VS Code. You can simply create or open an Vsce-Script project, then load it immediately at VS Code.

An Vsce-Script project is a VS Code extension project which can be dynamic loaded by Vsce-Script extension.

Since Vsce-Script extension inject VS Code and it's library api at global, you can write some script for control your VS Code, extend your vim command or doing something then executing it immediately.

With those API, user can do many of automating operations more than traditional Vim Macro.

Since vsce-script is an extension playground, you can fulfill your idea with it quickly. If your some of functionality can be a standalone extension. you can migrate it to a extension package and publish it quickly. 

We have already export our library api for third-party vscode extension!

If some of idea that is good for exist extensions, welcome to submit your pull request for them.


## Main Feature

Here are just some of the features that Vsce-Script provides

1. Open, Create, Write and execute your extension project with javascript and typescript at vscode immediately.
* You can install third-party npm package at extension project then execute it at vscode immediately.
2. Inject VS Code API at global for vsce-script extension project.
3. Commands for search registered command at script project, you can execute or copied their command ID easily.
4. Built-in Commands and library api for automating your VS Code.





5. Extension Playground: Join and Create a better vscode extension community!

Since vsce-script is an extension playground, you can fulfill your idea with it quickly. If your some of functionality can be a standalone extension. you can migrate it to a extension package and publish it quickly.If you found some idea that can be implement for exist extensions, welcome to submit your pull request for them.

1. Open, Create, Write and execute your extension script at vscode directly 
2. Automation api, provide utilities such as runMacro、execCmd(vscode command)、execShell(shell command)、spawnShell(shell command). Compatible with vim extension.
3. Custom interactive function: dropdown, confirm, commandQuickpick
4. Inject entire vscode api at global, you can develop vscode whatever you want.  
5. Install npm package and apply it at your project directly.
Since we export our library api for third-party vscode extension.When you want to publish your vscode extension to marketplace, you can easily migrate your code from VSCE-Script project to an vscode extension project.

## Showcase


1. Run Automation Task

- Install group of npm package easily

``` 
```

1. Improve Vim's operation


2. Integrate surroundWith extension with VSCodeVim (Workaround insertSnippet problem at VSCodeVim v0.1.23)



 
## Library API
---

### Automation

| Function            |  Type Signature                                 |
| ------------------- | -------------------------------------------     |
| type                | (typeText: string) => () => Thenable<void>;     |
| typeKeys            | (typeTexts: string[]) => () => Thenable<void>;  |
| typeCharUnderCursor | () => Thenable<void>;                           |
| writeText           | (text: string) => () => Thenable<void>;         |
| execCmd             | <T = unknown>( cmd: string \| { command: string; args: object }) => () => Thenable<T>; |  
| execShell           | (cmd: string) => () => Thenable<void>;          |
| spawnShell          | ( cmd: string, args?: string[], option?: SpawnOptions) => () => Thenable<void>; |                        
| runMacro            | (typeTexts: string[]) => Thenable<void>;        |
| runCommands         | (...args: any[]) => Thenable<void>;             |
| runAutomation       | ( ...commands: CommandPayload[]) => Thenable<void>;  |

### Commands

| Function            |  Type Signature                                                |
| ------------------- | -------------------------------------------------------------  |
| registerCommand     | ( commandId: string, handler: (...args: any) => any) => void;  |
| invokeCommands      | (typeTexts: string[]) => () => Thenable<void>;                 |

### Promise

| Function            |  Type Signature                           |
| ------------------- | ----------------------------------------- |
| type                | (typeText: string) => Thenable<void>;     |
| typeKeys            | (typeTexts: string[]) => Thenable<void>;  |
| typeCharUnderCursor | () => Thenable<void>;                     |
| writeText           | (text: string) => Thenable<void>;         |
| execCmd             | <T = unknown>( cmd: string \| { command: string; args: object }) =>  Thenable<T>; |  
| execShell           | (cmd: string) => Thenable<void>;          |
| spawnShell          | ( cmd: string, args?: string[], option?: SpawnOptions) => () => Thenable<void>; |                        

### Editor

| Function                      |  Type Signature                                 |
| ----------------------------- | -------------------------------------------     |
| getLine                       | (lineNumber: number) => string \| undefined;     |
| getCurrentLine                | (editor: vscode.TextEditor) => string;          |
| getSelectedText               | () => string \| undefined;                       |
| getCharUnderCursor            | () => string \| undefined;                       |
| findFirstOccurCharAtLine      | ( chars: string[], line: number, start: number) => string | undefined;                      |
| findFirstOccurCharAboveCursor | (chars: string[]) => string \| undefined;        |
| getCursorPosition             | () => vscode.Position \| undefined;              |
| setCursorPosition             | (pos: vscode.Position) => Promise<any>;         |
| getFirstCharOnLine            | ( document: vscode.TextDocument, line: number) => vscode.Position;    |
| getCharAt                     | ( document: vscode.TextDocument, position: vscode.Position) => string;         |

### Interactive

| Function            |  Type Signature                           |
| ------------------- | ----------------------------------------- |
| confirm             | ( title: string, placeHolder?: "Yes" | "No", options?: vscode.QuickPickOptions) => Promise<boolean>;     |
| input               | ( prompt: string, placeHolder: string, options?: vscode.InputBoxOptions) => Promise<string>;  |
| dropdown            | ( title: string, items: string[], placeHolder: string, options?: vscode.QuickPickOptions) => Promise<string | undefined>;                     |
| commandQuickpick    | ( setting: QuickpickSetting) => Promise<void>;     |


## Built-In User-Facing Commands
---


| Name                       | Type    |  Command(s)                                |
| -------------------------- | ------- | ------------------------------------------ |
| Open Project               | command |  `vsce-script.openProject`                 |
| Create Script Project      | command |  `vsce-script.createProject`               |
| Show All Commands          | command |  `vsce-script.showAllCommands`             |
| Copy Registered Command ID | command |  `vsce-script.copyRegisteredCommandId`     |
| Rerun Last Command         | command |  `vsce-script.rerunLastCommand`            |


### Built-In Vim Commands
---

| Name                            | Type    |  Command(s)                                    |  Description    |
| ------------------------------- | ------- | ---------------------------------------------- |-----------------|
| Change Surround                 | command |  `vsce-script.vim.changeSurround`              |                 |
| Delete Surround                 | command |  `vsce-script.vim.deleteSurround`              |                 |
| Change Inner Surround           | command |  `vsce-script.vim.changeInnerSurround`         |                 |
| Delete Inner Surround           | command |  `vsce-script.vim.deleteInnerSurround`         |                 |
| Visual Mode Yank                | command |  `vsce-script.vim.visualModeYank`              |  Keep cursor position after yank with selection text |
| Switch To Insert Mode Selection | command |  `vsce-script.vim.switchToInsertModeSelection` |                 | 

### Built-in Interactive Commands

| Name                            |  Command(s)                                    | Arguments        |  Description    |
| ------------------------------- | ---------------------------------------------- | ---------------- |-----------------|
| Command Quick Pick Menu         |  `vsce-script.interactive.commandQuickPick`    | QuickpickSetting |  Display a dropdown menu with commands      |

* QuickpickSettings Type Definition

```
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
```

###

### Show Cases


### Why we need this extension? What problem does it solve?

- Case Study: Select a function block  

We need to select a function or json block, thus we create a macro to make this operation easier.

At VSCodeVim's `.vimrc`, we define a custom keybindings `vak` for select

```
xmap ak <Esc>[{V$%$h
```

It's hard to read and understand.

With Js, we can write macro like below example:

```js=
    registerCommand('vsce-script.selectEntireBlock', () => {
        const switchToNormalMode = '<Esc>';
        const jumpToFunctionStart = '[{';
        const enterVisualLineMode = 'V';
        const moveCursorToLineEnd = '$';
        const selectMatchedBracket = '%';
        const adjustCursorPosition = '$h';
        await runMacro([
            switchToNormalMode,
            jumpToFunctionStart,
            enterVisualLineMode,
            moveCursorToLineEnd,
            selectMatchedBracket,
            adjustCursorPosition
        ]);
    });
```

Image (select a block)


This macro can't handle all situation, if we are in a json file, and we want to select a block.


- Limit 1: Can not rerun
- Limit 2: Can not handle all situation, such as `[`

If we need to select a block with an array, It will fail.

- Easily integrate it with VS Code's bulti-in command and third party extension's command

- Reusable macro with better readability 

- Dynamic Macro

- Better Surround With

- Improve refactor library behavior
