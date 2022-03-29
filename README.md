# vsce-script

- Feature

0. Extension Playground: Join and Create a better vscode extension community!

Since vsce-script is an extension playground, you can fastly implement your idea with it quickyly. If you found someof functionality can be a standlone extension. you can migrate it to a extension package and publish it quicky.If you found some idea that is good for exist extension, welcome to submit your pull request.

1. Open, Create, Write and execute your extension script at vscode directly 
2. Library for automation, provide utilities such as runMacro、execCmd(vscode command)、execShell(shell command)、spawnShell(shell command); 

### ShowCases


### Why we neeed this extension? What problem does it solve?

- Case Study: Select a function block  

We need to select a function or json block, thus we create a macro to make this operation easier.

At VSCodeVim's `.vimrc`, we define a custom keybindings `vak` for select

```
xmap ak <Esc>[{V$%$h
```

It's hard to read and understand.

With Js, we can write macro like below example:

```
```

Image (select a block)


This macro can't handle all situation, if we are in a json file, and we want to select a block.

- Limit 1: Can not rerun
- Limit 2: Can not handle all situation, such as `[`

if we 

- Easily integrate it with VS Code's bulti-in command and third party extension's command

- Reusable macro with better readability 

- Dynamic Macro

- Better Surround With

- Improve refactor library behavior
