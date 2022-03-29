const { setupModule2 } = require('./vscode-api');

/**
 * @param { vscode } vsc 
 * @returns 
 */
const completionProvider = (vsc) => ({
    /**
     * @param { vscode.TextDocument } document
     * @param { vscode.Position } position
     * @param { vscode.CancellationToken } token
     * @param { vscode.CompletionContext } context
     */
    provideCompletionItems(document, position, token, context) {
        console.log('position', position);
        // a simple completion item which inserts `Hello World!`
        const simpleCompletion = new vsc.CompletionItem('Hello World!');

        // a completion item that inserts its text as snippet,
        // the `insertText`-property is a `SnippetString` which will be
        // honored by the editor.
        const snippetCompletion = new vsc.CompletionItem('Good part of the day');
        snippetCompletion.insertText = new vsc.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
        snippetCompletion.documentation = new vsc.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

        // a completion item that can be accepted by a commit character,
        // the `commitCharacters`-property is set which means that the completion will
        // be inserted and then the character will be typed.
        const commitCharacterCompletion = new vsc.CompletionItem('console');
        commitCharacterCompletion.commitCharacters = ['.'];
        commitCharacterCompletion.documentation = new vsc.MarkdownString('Press `.` to get `console.`');

        // a completion item that retriggers IntelliSense when being accepted,
        // the `command`-property is set which the editor will execute after 
        // completion has been inserted. Also, the `insertText` is set so that 
        // a space is inserted after `new`
        const commandCompletion = new vsc.CompletionItem('new');
        commandCompletion.kind = vsc.CompletionItemKind.Keyword;
        commandCompletion.insertText = 'new ';
        commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

        const range = document.lineAt(position.line).range;
        const currentWordRange = document.getWordRangeAtPosition(position);
        const currentWord = document.getText(currentWordRange);

        console.log('Word', currentWord);
        const start = document.lineAt(position.line).range.start;
        const propertyCompletion = new vsc.CompletionItem('let');
        propertyCompletion.kind = vsc.CompletionItemKind.Property;
        // propertyCompletion.insertText = 'let variable = ';

        // propertyCompletion.textEdit = new vsc.TextEdit(range, `let variable = `);
        // propertyCompletion.range = new vsc.Range(start, start.translate(0, propertyCompletion.insertText.length));
        propertyCompletion.command = {
            command: 'vsce-script.insertLet', arguments: [{
                pos: {
                    line: start.line,
                    character: start.character
                },
                text: `let variable = `
            }]
        };

        // return all completion items as array
        return [
            simpleCompletion,
            snippetCompletion,
            commitCharacterCompletion,
            commandCompletion,
            propertyCompletion
        ];
    }
});

/**
 * @param { vscode } vsc
 * @param { 'let' | 'var' | 'const' } declaration
 * @return { vscode.CompletionItemProvider } vscodeApi
 */
function declarationCompletionItems(api) {
    return ({
        triggerCharacters: ["."],
        provideCompletionItems(document, position, _token, _context) {
            try {
                const letCompletion = createDeclarationCompletionItem(api, 'let', document, position);
                const constCompletion = createDeclarationCompletionItem(api, 'const', document, position);
                const varCompletion = createDeclarationCompletionItem(api, 'var', document, position);
                return [
                    letCompletion,
                    constCompletion,
                    varCompletion
                ];
            } catch (err) {
                console.error(err);
            }
        }
    });
}

function createDeclarationCompletionItem(api, declaration, document, position) {
    const { vscodeApi, editor: { getFirstCharOnLine } } = api;
    try {
        const { CompletionItem } = vscodeApi;
        const start = document.lineAt(position.line).range.start;
        const propertyCompletion = new CompletionItem(declaration);
        const firstCharOnLine = getFirstCharOnLine(document, position.line);
        propertyCompletion.command = {
            command: 'vsce-script.insertDeclarationJs', arguments: [{
                inserting: {
                    line: start.line,
                    character: firstCharOnLine.character
                },
                replacing: {
                    start: {
                        line: start.line,
                        character: position.character - 2
                    },
                    end: {
                        line: start.line,
                        character: position.character + declaration.length
                    }
                },
                type: declaration
            }]
        };
        return propertyCompletion;
    } catch (err) {
        console.error(err);
    }
}

function getCharAt(document, position) {
    console.log('getCharAt', position);
    const pos = document.validatePosition(position);
    console.log('pos', pos);
    return document.lineAt(pos).text[position.character];
}

/**
 * Set the title with the provided value.
 * @param { vscode } Api
 * @return { Node } H1 element.
 */
async function activate(context) {
    console.log('lib', lib);
    const {
        vscodeApi,
        commands: { registerCommand, runMacro },
        editor: {
            registerCompletionProvider,
            getFirstCharOnLine,
            getCharUnderCursor,
            // getCharAt,
            getSelectedText,
            createNewFile
        }
    } = lib;
    console.log('vsc', vscode);
    // console.log('gvsc', global.vscode);
    // console.log('t', test);
    // console.log('gt', global.test);
    // setupModule2(context, api);
    vscode.window.showInformationMessage('enable vsce-script6!');

    registerCompletionProvider('typescript', declarationCompletionItems(lib));
    // registerCompletionProvider('javascript', declarationCompletionItems({...api}));

    registerCommand('vsce-script.surroundSnippet', () => {
        try {
            vscode.window.showInformationMessage('Hello');
            // vscode.commands.executeCommand('editor.action.surroundWithSnippet', {
            //     snippet: 'text'
            // });
        } catch (err) {
            console.error('snippet', err);
        }
    });

    registerCommand('vsce-script.insertDeclarationJs', (args) => {
        const { window, Position, Range, SnippetString } = vscodeApi;
        const activeTextEditor = window.activeTextEditor;
        if (!activeTextEditor) return;
        console.log('insertText', args);
        try {
            const { inserting, replacing, type } = args;
            activeTextEditor.edit(editBuilder => {
                const replacingStart = new Position(replacing.start.line, replacing.start.character);
                const replacingEnd = new Position(replacing.end.line, replacing.end.character + type.length + 1);
                editBuilder.replace(new Range(replacingStart, replacingEnd), ';');
            }).then(_ => {
                activeTextEditor.insertSnippet(
                    new SnippetString(type + " ${0:newLocal} = "),
                    new Position(inserting.line, inserting.character)
                );
            });
        } catch (error) {
            console.error(error);
        }
    });

    registerCommand('vscs.editScript', async () => {
        const scriptPath = vscode.workspace.getConfigutation('vsce-script.scriptPath');
        if (scriptPath && scriptPath !== '') {
            const document = await vscode.workspace.openTextDocument(scriptPath);
            await vscode.window.showTextDocument(document);
        } else {
            await vscode.window.showWarningMessage('No script found. Please set `vsce-script.scriptPath.`');
        }
    });

    registerCommand('vscs.helloWorld', async () => {
        vscode.window.showInformationMessage('hello world');
    });

    registerCommand('vsce-script.deleteSurround', async () => {
        vscodeApi.window.showInformationMessage('vsce-script:deleteSurround');
        const charUnderCursor = getCharUnderCursor();
        console.log('charUnderCurssor', charUnderCursor);
        await runMacro(['<plugds>', `${charUnderCursor}`]);
    });

    registerCommand('vsce-script.changeSurround', async () => {
        vscode.window.showInformationMessage('vsce-script:changeSurround');
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) return;
        const doc = activeTextEditor?.document;
        const charUnderCursor = getCharAt(doc, activeTextEditor.selection.active);
        console.log('charUnderCursor', charUnderCursor);
        await runMacro(['<plugcs>', `${charUnderCursor}`]);
    });

    registerCommand('vsce-script.moveToNewFile', async () => {
        const selected = getSelectedText();
        console.log('selected', selected);
        createNewFile('testContent');
    });
};

async function deactivate() {

}

module.exports = { activate, deactivate };