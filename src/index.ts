import { Client, GatewayIntentBits, Partials } from "discord.js"
import "dotenv/config"

import ready from "./events/clientReady"
import interactionCreate from "./events/interactionCreate"
import messageReaction from "./events/messageReaction"
import "./utils/memes-reset"

export const client: Client<boolean> = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User
    ]
})

// Define a type for the emoji object
export interface EmojiObject {
    id: string,
    name: string,
    count: number
}

// Define a type for the entry
export interface ScoreEntry {
    id: string,
    username: string,
    reactions: {
        weekly: EmojiObject[],
        monthly: EmojiObject[],
        yearly: EmojiObject[]
    }
}

ready(client)
interactionCreate(client)
messageReaction(client)

client.login(process.env.TOKEN)