import { Client, GatewayIntentBits, Partials } from "discord.js"
import "dotenv/config"

import ready from "./events/clientReady"
import interactionCreate from "./events/interactionCreate"
import messageReaction from "./events/messageReaction"

const client: Client<boolean> = new Client({
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

ready(client)
interactionCreate(client)
messageReaction(client)

client.login(process.env.TOKEN)