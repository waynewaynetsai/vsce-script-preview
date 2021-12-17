export type CommandPayload = (string | { command: string; args: object });

export type CommandFactory<T = any> = () => Thenable<T>;

export interface TypeCommand {
    command: string;
    args: {
        text: string;
    };
}