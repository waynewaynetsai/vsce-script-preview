import { TypeCommand } from "../models/index";
import * as vscode from "vscode";
import { invokeCommands } from "./command";

// export const runMacro = (inputs: string[]) => {
//     const commands = inputs.map(i => makeTypeCommand(i));
//     return invokeCommands(commands);
// };

export const makeTypeCommand = (input: string): TypeCommand => {
    return {
        command: "text",
        args: {
            text: input
        }
    };
};

export const handleKeyEvent = (cmd: string) => {
    return vscode.commands.executeCommand("type", {
        text: cmd
    });
};