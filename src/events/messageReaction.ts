import {
    Client,
    User, PartialUser,
    MessageReaction, PartialMessageReaction
} from "discord.js"
import { EmojiObject, ScoreEntry } from "./../index"
import fs from "fs"
import "dotenv/config"

async function messageReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    delta: number
) {
    // Check for partials and nulls
    if (reaction.partial || !reaction) reaction = await reaction.fetch()
    if (reaction.message.partial || !reaction.message) reaction.message = await reaction.message.fetch()
    if (user.partial || !user) user = await user.fetch()

    // Check for self-reacting
    if (reaction.message.author === user) return

    // Check for attachments
    //if (reaction.message.attachments.size <= 0) return

    // Check for the right channel
    if (reaction.message.channel.id !== process.env.MEME_ID) return

    // Check for null author
    const author = reaction.message.author
    if (!author) return



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
    for (const [type, reactions] of Object.entries(entry.reactions)) {
        const now: Date = new Date()
        const messageDate: Date = reaction.message.createdAt

        let valid: Boolean = false
        switch (type) {
            case "weekly":
                // Kudos to Michael Lynch https://stackoverflow.com/a/63588590
                const todayDate = now.getDate()
                const todayDay = now.getDay()
                const firstDayOfWeek = new Date(now.setDate(todayDate - todayDay))
                const lastDayOfWeek = new Date(firstDayOfWeek)
                lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6)

                if (messageDate >= firstDayOfWeek && messageDate <= lastDayOfWeek) valid = true
                break
            case "monthly":
                if (now.getMonth() === messageDate.getMonth()) valid = true
                break
            case "yearly":
                if (now.getFullYear() === messageDate.getFullYear()) valid = true
                break
        }

        if (!valid) continue

        const emoji: EmojiObject | undefined = reactions.find(r => r.id === reaction.emoji.identifier)

        if (emoji) {
            emoji.count += delta

            if (emoji.count <= 0) {
                const index: number = reactions.findIndex(r => r.id === reaction.emoji.identifier)
                reactions.splice(index, 1)
            }
        } else if (delta > 0) {
            reactions.push({
                id: reaction.emoji.identifier,
                name: reaction.emoji.name ?? reaction.emoji.id ?? "",
                count: 1
            })
        }
    }

    // Save scores to the memes.json file
    fs.writeFileSync("src/logs/memes.json", JSON.stringify(scores, null, 4))
}

export default (client: Client): void => {
    client.on("messageReactionAdd", (reaction, user) => {
        messageReaction(reaction, user, +1)
    })

    client.on("messageReactionRemove", (reaction, user) => {
        messageReaction(reaction, user, -1)
    })
}
