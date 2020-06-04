import * as discord from 'discord.js';

export class EntrosMain {
    public discord: typeof discord;
    public client: EntrosClient;
    public commands: discord.Collection<string, Command>;
    public Resource: Resource;
    public MessageHandler: MessageHandler;

    public constructor();
}

export class MessageHandler {
    public constructor(main: EntrosMain);

    public handleMessage(ctx: EntrosMessage): Promise<void>;
    public shouldHandleMessage(ctx: EntrosMessage): Promise<boolean>;
    public splitArgs(string: string): string;
    public handlePermissions(comamnd: Command, ctx: EntrosMessage): {
        pass: boolean,
        reason: string,
        missingPermissions: permissionString[]
    }
}

export class Resource {
    public constructor(main: EntrosMain);

    public loadCommands(): Promise<boolean>
    public loadEvents(): Promise<boolean>
    public loadModules(): Promise<boolean>
}

export class EntrosClient extends discord.Client {
    public main: EntrosMain
}

export type Command = {
    description?: string,
    userPermissions?: permissionString[],
    aliases?: string[],
    fn: (ctx: discord.Message, args: string[], argString) => Promise<discord.Message | discord.Message[]>
}

export type permissionString = 'BOT_OWNER' | discord.PermissionString

export class EntrosMessage extends discord.Message {
    public main: EntrosMain;
    private _command: string;

    public get command(): Command;
    public set command(name: string): Command; 
}