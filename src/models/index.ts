export type CommandPayload = (string | { command: string; args: object });

export interface TypeCommand {
    command: string;
    args: {
        text: string;
    };
}