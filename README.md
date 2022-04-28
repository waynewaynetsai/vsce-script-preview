# Vsce Script: automate your VS Code and Vim extension with javascript and typescript conveniently

Vsce Script is an open-source extension for Visual Studio Code and Vim Extension.

Vsce Script provide VS Code extension's runtime, VS Code API and Library for creating smoothly operation at VS Code. You can simply create or open an Vsce Script project, then load it immediately at VS Code.

A Vsce Script project is a typescript project which can be dynamic loaded by Vsce-Script extension.

Since Vsce Script extension inject VS Code and it's library api at global, you can write some script for control your VS Code, extend your vim command or doing something then executing it immediately.

With those API, user can do many of automating operations more than traditional Vim Macro.

Since Vsce Script is an extension playground, you can fulfill your idea with it quickly. If your some of functionality can be a standalone extension. you can migrate it to a extension package and publish it quickly. 

We have already export our library api for third-party vscode extension!

If some of idea that is good for exist extensions, welcome to submit your pull request for them.

## Main Feature

Here are just some of the features that Vsce-Script provides

1. Open, create, and execute your extension project with javascript and typescript at vscode immediately.
* You can install third-party npm package at extension project then execute it at vscode immediately.
2. Inject VS Code API at global for vsce-script extension project.
3. Commands for search registered command at script project, you can execute or copied their command ID easily.
4. Built-in Commands and library api for automating your VS Code.


### Make Open Source Community Better!

Since vsce-script is an extension playground, you can fulfill your idea with it quickly. If your some of functionality that can be extract to a standalone extension. you can migrate it to a new extension package and publish it quickly.If you found some idea that can be implement for exist extensions, welcome to submit your pull request for them.

## Get Started

## Showcases


### Run Automation Task

1. Execute Shell Command (execShell) and VS Code Command (execCmd) One by One

```
// Import vscode typings
import * as vsc from 'vscode';

// Injected vscode api module at global
const { window } = vscode;

const {
    commands: { registerCommand },
    automation: { execCmd, execShell, runAutomation }
} = lib;

export function activate(context: vsc.ExtensionContext) {
    ...
    registerCommand('vsce-script.startup.frontend', async () => {
        window.showInformationMessage(`Opening apps for frontend project!`);
        // VS Code's built-in commandId for execCmd function
        const createTerminal = 'workbench.action.terminal.new';
        const openPostman_MacOS = 'open -a Postman';
        const openChrome_MacOS = 'open -a "Google Chrome" https://localhost:3000';
        await runAutomation(
            execShell(openPostman_MacOS),
            execCmd(createTerminal),
            () => {
                const terminal = vscode.window.activeTerminal;
                terminal?.sendText('yarn serve');
                return Promise.resolve();
            },
            execShell(openChrome_MacOS, { hideOutput: true }),
        );
    });
    ...
}
```

2. Manage npm package and install them easily

As a frontend developer, we often install lots of npm packages at our project. 
It takes a lot of effort to reinstall it at a new project. Now with Vsce-Script, you can easily define your custom `addDeps` command for install them.

- `deps.ts`

For managing those config easily, we can extract those complex npm packages's config to `deps.ts`.

```
const tsDeps = ['typescript', 'ts-loader', 'ts-node'];

const webpack = ['webpack', 'webpack-cli'];

const webpackLoader = [
    'file-loader',
    'url-loader',
    'html-loader',
    'null-loader',
    'style-loader',
    'imports-loader',
    'url-loader',
    'svg-url-loader',
    'css-loader'
];

const webpackPlugin = [
    'copy-webpack-plugin',
    'add-asset-html-webpack-plugin',
    'circular-dependency-plugin',
    'compression-webpack-plugin',
    'offline-plugin',
    'terser-webpack-plugin'
];

const jest = ['jest@27.4.7', 'ts-jest@27.1.3'];

const reactCommonPackages = [
    'react-redux@7.0.2',
    'redux@4.0.1',
    'prop-types@15.7.2',
    'react-router-dom@5.0.0',
    'redux-saga@1.0.2',
    'style-components@4.2.0',
    'immer@9.0.6'
];

const babel = ['@babel/core', 'babel-loader', '@babel/preset-env'];

const babelProdDeps = ['@babel/polyfill'];

const babelPlugins = [
    '@babel/runtime',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-react-constant-elements',
    '@babel/plugin-transform-react-inline-elements',
    '@babel/preset-react',
    '@babel/register',
];

const mocha = ['mocha'];

export const devDeps = {
    tsDeps,
    webpack,
    webpackLoader,
    webpackPlugin,
    jest,
    mocha,
    reactCommonPackages,
    babel,
    babelProdDeps,
    babelPlugins,
};

export const deps = {
    babelProdDeps
};
```

- `extension.ts`

At `extension.ts`, we can define a custom command `vsce-script.yarn.addDeps` for installing packages.
Since our library provide some interactive utilities such as dropdown and confirm.
You can reduce your extension development time with those scenario.  

``` 
...
// Import vscode typings
import * as vsc from 'vscode';

import { deps, devDeps } from './deps';

const {
    commands: { registerCommand },
    promise: { execShell },
    interactive: { dropdown }
} = lib;

export function activate(context: vsc.ExtensionContext) {
    ...
    registerCommand('vsce-script.yarn.addDeps', async () => {
        const depItems = [...Object.keys(devDeps), ...Object.keys(deps)];
        const item = await dropdown('Install Deps', depItems);
        if (!item) return;
        if (deps[item]) {
            await execShell(`yarn add ${deps[item].join(' ')}`);           
        } else if (devDeps[item]){
            const depsPackages = devDeps[item].join(' ');
            await execShell(`yarn add -D ${depsPackages}`);
        }
    });
    ...
}
```

After you write your custom command, you can invoke `Vsce Script: Load Script Project` command from VS Code's command palette.
If your extension project is typescript project


1. Readable, editable and persistent macro for Vim's operation

Imagine there's a vim operation for select a function or any kinds of block.
You might create a macro to make this operation easier.

At VSCodeVim's `.vimrc`, we can define a custom keybindings `vak` for select it.

```
xmap ak <Esc>V$%$h
```

It's hard to read and understand.

With javascript, we can write a editable and reusable macro with below example:

```js=
...

const {
    commands: { registerCommand },
    automation: { runMacro }
} = lib;

export function activate(context: vsc.ExtensionContext) {
    ...
    registerCommand('vsce-script.vim.selectEntireBlock', async () => {
        const enterNormalMode = '<Esc>';
        const enterVisualLineMode = 'V';
        const moveCursorToLineEnd = '$';
        const selectMatchedBracket = '%';
        const adjustCursorPosition = '$h';
        await runMacro([
            enterNormalMode,
            enterVisualLineMode,
            moveCursorToLineEnd,
            selectMatchedBracket,
            adjustCursorPosition
        ]);
    });
    ...
}
```

Then you can apply this command to `.vimrc`.

```
xmap ak vsce-script.vim.selectFunctionBlock
```

> P.S. At VSCodeVim v1.23.0, we can not edit vim's macro. All recorded macro will lost after reloading VS Code.

4. Dynamic macro with vim extension

- Custom operation for VSCodeVim's Vim-surround plugin (Delete Surround)

```
...
const {
    commands: { registerCommand },
    automation: { runMacro },
    editor: { getCharUnderCursor },
} = lib;

export function activate(context: vsc.ExtensionContext) {
    ...
    registerCommand('vsce-script.vim.deleteSurround', async () => {
        const charUnderCursor = getCharUnderCursor();
        if (!charUnderCursor) return;
        await runMacro(['<plugds>', charUnderCursor]);
    });
    ...
}
```

Consider edge cases for html and xml tags:

```
const {
    ...
    interactive: { confirm }
} = lib;

    ...
    registerCommand('vsce-script.vim.deleteSurround', async () => {
        const charUnderCursor = getCharUnderCursor();
        if (!charUnderCursor) return;
        if (['<', '>'].includes(charUnderCursor)) {
            const removeXmlTag = await confirm('Remove xml tag?');
            const typeCommand = removeXmlTag ? 't' : '>';
            await runMacro(['<plugds>', typeCommand]);
        } else {
            await runMacro(['<plugds>', charUnderCursor]);
        }
    });
    ...
```

After that, we can bind this command at VSCodeVim's `.vimrc`.

```
nmap da vsce-script.vim.deleteSurround
```

- Custom operation for VSCodeVim's Vim-surround plugin (Change Surround)

```
...
const {
    commands: { registerCommand },
    automation: { runMacro },
    editor: { getCharUnderCursor },
    interactive: { confirm }
} = lib;

export function activate(context: vsc.ExtensionContext) {
    ...
    const charUnderCursor = getCharUnderCursor();
        if (!charUnderCursor) return;
        if (['<', '>'].includes(charUnderCursor)) {
            const removeXmlTag = await confirm('Remove xml tag?');
            const typeCommand = removeXmlTag ? 't' : '>';
            await runMacro(['<plugcs>', typeCommand]);
        } else {
            await runMacro(['<plugcs>', charUnderCursor]);
        }
    ...
}
```

After that, we can bind this command at VSCodeVim's `.vimrc`.

```
nmap ca vsce-script.vim.changeSurround
```

5. Integrate [Surround](https://marketplace.visualstudio.com/items?itemName=yatki.vscode-surround) extension with VSCodeVim (Workaround insertSnippet problem at VSCodeVim v0.1.23)

There's an VSCodeVim's [issue](https://github.com/VSCodeVim/Vim/issues/6772) with VS Code's `insertSnippet` command. Currently we can use custom `switchToInsertModeSelection` to force VS Code switch and keep visual mode selection at insert mode. 

When we execute any commands with `insertSnippet` command at Vim's insert mode, everything works well.

Below is an example for creating custom command for Surround extension.

```
...

const {
    commands: { registerCommand },
    vim: { switchToInsertModeSelection }
} = lib;

export function activate(context: vsc.ExtensionContext) {
    ...
    registerCommand('vsce-script.vim.surroundWith', async () => {
        await switchToInsertModeSelection();
        vscode.commands.executeCommand('surround.with');
    });
    ...
}
```

Then you can rebind this command at VSCodeVim's visualModeKeybindings.

```
xmap <leader>s vsce-script.vim.surroundWith
```

6. Disable specific extensions at new window

Here's an VS Code's unsolved issue for enable/disable specific extension from API or commands.

See: [How to enable / disable extension from API or commands](https://github.com/microsoft/vscode/issues/15466)

Here's a scenario of disabling specific extensions.

Imagine we have a frontend project with react snippet, it will jump snippet completion at any kinds of typescript project at VS Code.

When we are developing NodeJS project, we might be bothered with unused react snippet.

Since VS Code provide an undocument options for disabling extension with `code` command for trobleshooting.

If we want to disable an extension, we can use below command for disable an extension.

```
code --disable-extension <ext-id>
```

However, disabled command only works with VS Code's window which is opened from that code command.

So we need to invoke this command for disabling a set of extensions before opening our project every time.

With Vsce Script, we can create below utility function for making this command and it's options more easier.

```
// On macOS, first time you need to run `install Code command` at vscode manually  
// Limitation: you need to reopen VS Code with this function for disabling extensions
async function reopenForDisablingExtensions(reopenWorkspacePath: string, extensions: string[]) {
    const disableExtensions = extensions.map(extId => `--disable-extension ${extId}`).join(' ');
    const codeCommand = `code ${disableExtensions} -n ${reopenWorkspacePath}`;
    const closeWindow = `workbench.action.closeWindow`;
    await runAutomation(
        execShell(codeCommand),
        execCmd(closeWindow)
    );
}
```

Then we can use this function with our custom command.

```
registerCommand('vsce-script.ext.disableReactExtensions', async () => {
    const workspace = await getCurrentWorkspaceFolder();
    if (!workspace) return;
    const workspacePath = workspace.uri.fsPath ?? '.');
    const reactExtensions = [
        'dsznajder.es7-react-js-snippets',
        'discountry.react-redux-react-router-snippets'
    ];
    await reopenForDisablingExtensions(workspacePath, disableExtensions);
});
```



## Library API
---

### Automation

| Function            |  Type Signature                                 |
| ------------------- | -------------------------------------------     |
| type                | (typeText: string) => () => Thenable\<void\>;     |
| typeKeys            | (typeTexts: string[]) => () => Thenable\<void\>;  |
| typeCharUnderCursor | () => Thenable\<void\>;                           |
| writeText           | (text: string) => () => Thenable\<void\>;         |
| execCmd             | \<T = unknown\>( cmd: string \| { command: string; args: object }) => () => Thenable\<T\>; |  
| execShell           | (cmd: string) => () => Thenable\<void\>;          |
| spawnShell          | ( cmd: string, args?: string[], option?: SpawnOptions) => () => Thenable\<void\>; |                        
| runMacro            | (typeTexts: string[]) => Thenable\<void\>;        |
| runCommands         | (...args: any[]) => Thenable\<void\>;             |
| runAutomation       | ( ...commands: CommandPayload[]) => Thenable\<void\>;  |

### Commands

| Function            |  Type Signature                                                |
| ------------------- | -------------------------------------------------------------  |
| registerCommand     | ( commandId: string, handler: (...args: any) => any) => void;  |
| invokeCommands      | (typeTexts: string[]) => () => Thenable\<void\>;                 |

### Promise

| Function            |  Type Signature                           |
| ------------------- | ----------------------------------------- |
| type                | (typeText: string) => Thenable\<void\>;     |
| typeKeys            | (typeTexts: string[]) => Thenable\<void\>;  |
| typeCharUnderCursor | () => Thenable\<void\>;                     |
| writeText           | (text: string) => Thenable\<void\>;         |
| execCmd             | <T = unknown>( cmd: string \| { command: string; args: object }) =>  Thenable\<T\>; |  
| execShell           | (cmd: string) => Thenable\<void\>;          |
| spawnShell          | ( cmd: string, args?: string[], option?: SpawnOptions) => () => Thenable\<void\>; |                        

### Editor

| Function                      |  Type Signature                                 |
| ----------------------------- | -------------------------------------------     |
| getLine                       | (lineNumber: number) => string \| undefined;     |
| getCurrentLine                | (editor: vscode.TextEditor) => string;          |
| getSelectedText               | () => string \| undefined;                       |
| getCharUnderCursor            | () => string \| undefined;                       |
| findFirstOccurCharAtLine      | ( chars: string[], line: number, start: number) => string \| undefined;                      |
| findFirstOccurCharAboveCursor | (chars: string[]) => string \| undefined;        |
| getCursorPosition             | () => vscode.Position \| undefined;              |
| setCursorPosition             | (pos: vscode.Position) => Promise\<any\>;         |
| getFirstCharOnLine            | ( document: vscode.TextDocument, line: number) => vscode.Position;    |
| getCharAt                     | ( document: vscode.TextDocument, position: vscode.Position) => string;         |

### Interactive

| Function            |  Type Signature                           |
| ------------------- | ----------------------------------------- |
| confirm             | ( title: string, placeHolder?: "Yes" \| "No", options?: vscode.QuickPickOptions) => Promise\<boolean\>;     |
| input               | ( prompt: string, placeHolder: string, options?: vscode.InputBoxOptions) => Promise\<string\>;  |
| dropdown            | ( title: string, items: string[], placeHolder: string, options?: vscode.QuickPickOptions) => Promise\<string | undefined>\;                     |
| commandQuickpick    | ( setting: QuickpickSetting) => Promise\<void\>;     |


## Built-In User-Facing Commands
---


| Name                       | Type    |  Command(s)                                |
| -------------------------- | ------- | ------------------------------------------ |
| Open Project               | command |  `vsce-script.openProject`                 |
| Create Script Project      | command |  `vsce-script.createProject`               |
| Show All Commands          | command |  `vsce-script.showAllCommands`             |
| Copy Registered Command ID | command |  `vsce-script.copyRegisteredCommandId`     |
| Rerun Last Command         | command |  `vsce-script.rerunLastCommand`            |


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

# Contributing

Contributions are greatly appreciated. Please fork the repository and submit a pull request.
