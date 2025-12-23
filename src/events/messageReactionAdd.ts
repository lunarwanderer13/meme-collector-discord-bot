import {
    Client,
    User, PartialUser,
    MessageReaction, PartialMessageReaction
} from "discord.js"
import fs from "fs"
import "dotenv/config"

export default (client: Client): void => {
    client.on("messageReactionAdd", async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
        // Check for partials and nulls
        if (reaction.partial || !reaction) reaction = await reaction.fetch()
        if (reaction.message.partial || !reaction.message) reaction.message = await reaction.message.fetch()
        if (user.partial || !user) user = await user.fetch()

        // Check for self-reacting
        if (reaction.message.author === user) return

        // Check for attachments
        if (reaction.message.attachments.size <= 0) return

        // Check for the right channel
        if (reaction.message.channel.id !== process.env.MEME_ID) return

        // Check for null author
        const author = reaction.message.author
        if (!author) return



        // Define a type for the entry
        interface ScoreEntry {
            id: string,
            username: string,
            reactions: {
                weekly: [string, string, number][],
                monthly: [string, string, number][],
                yearly: [string, string, number][]
            }
        }

        // Get the scores and the entry
        const scores: ScoreEntry[] = JSON.parse(fs.readFileSync("src/logs/memes.json", "utf-8"))
        let entry = scores.find(e => e.id === author.id)

        // Default entry for new entries
        if (!entry) {
            // Define the default entry...
            entry = {
                "id": author.id,
                "username": author.username,
                "reactions": {
                    "weekly": [],
                    "monthly": [],
                    "yearly": []
                }
            }

            // ...and push it into the scores array
            scores.push(entry)
        }

        // Loop through all reaction arrays
        for (const reactions of Object.values(entry.reactions)) { // FIX ME
            reactions.push([reaction.emoji.identifier, reaction.emoji.name ?? reaction.emoji.id ?? "", reaction.count])
        }

        // Save scores to the memes.json file
        fs.writeFileSync("src/logs/memes.json", JSON.stringify(scores, null, 4))
    })
}