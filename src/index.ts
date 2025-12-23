import { Client, GatewayIntentBits, Partials } from "discord.js"
import "dotenv/config"

import ready from "./events/clientReady"
import interactionCreate from "./events/interactionCreate"

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
        Partials.Reaction
    ]
})

ready(client)
interactionCreate(client)

client.login(process.env.TOKEN)