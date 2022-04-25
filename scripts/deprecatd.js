/**
 * @param { vscode } vsc 
 * @returns 
 */
export const completionProvider = (vsc) => ({
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
