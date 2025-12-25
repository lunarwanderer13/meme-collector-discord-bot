import { EmbedBuilder } from "discord.js"
import { client, EmojiObject, ScoreEntry } from "./../index"
import fs from "fs"
import schedule from "node-schedule"
import "dotenv/config"

// Logging function
function log(level: string, message: string): void {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${level}]: ${message}`)
}

function load(): ScoreEntry[] {
    return JSON.parse(fs.readFileSync("src/logs/memes.json", "utf-8"))
}

function save(data: ScoreEntry[]): void {
    fs.writeFileSync("src/logs/memes.json", JSON.stringify(data, null, 4))
    log("LOG", `Resetted weekly reaction scores.`)
}

async function best_memer(type: "weekly" | "monthly" | "yearly", scores: ScoreEntry[]): Promise<void> {
    // Get the meme channel
    const meme_channel = await client.channels.fetch(process.env.MEME_ID!)
    if (!meme_channel) return
    if (!meme_channel.isSendable()) return

    try {
        const getTotalEmojis = (entry: ScoreEntry): number => {
            return entry.reactions[type].reduce((sum, emoji) => sum + emoji.count, 0)
        }

        // Sort the scores array by how many emojis everyone got
        scores.sort((a, b) => getTotalEmojis(b) - getTotalEmojis(a))
        const winner: ScoreEntry = scores[0]

        // Get the winner's name
        const guild = await client.guilds.fetch(process.env.GUILD_ID!)
        let name: string
        try {
            const member = await guild.members.fetch(winner.id)
            name = member.displayName
        } catch {
            name = winner.username
        }
        name = name.replaceAll("*", "\\*").replaceAll("_", "\\_")

        // Set the embed's title
        let title: string
        switch (type) {
            case "weekly":
                title = "W tym tygodniu"
                break
            case "monthly":
                title = "W tym miesiącu"
                break
            case "yearly":
                title = "W tym roku"
                break
        }

        const honorifics: string[] = [
            "śmieszkiem heheszkiem",
            "memiarzem",
            "żartownisiem",
            "ancymonkiem",
            "komediantem"
        ]
        const honorific = honorifics[Math.floor(Math.random() * honorifics.length)]
        title += ` najlepszym ${honorific} był/a **${name}**!`

        // Set the embed's description
        let description: string = ""
        winner.reactions[type].forEach((reaction: EmojiObject, index: number) => {
            description += `**${reaction.name}: x${reaction.count}**`
            if (index + 1 < winner.reactions[type].length) description += "\n"
        })

        const embed = new EmbedBuilder()
            .setColor("#ff6432")
            .setTitle(title)
            .setDescription(description)

        try {
            const member = await guild.members.fetch(winner.id)
            embed.setThumbnail(member.displayAvatarURL())
        } catch {
            const user = await client.users.fetch(winner.id)
            embed.setThumbnail(user.displayAvatarURL())
        }

        await meme_channel.send({ content: `${await client.users.fetch(winner.id)}`, embeds: [embed] })
    } catch {
        const embed = new EmbedBuilder()
            .setColor("#ff6432")
            .setTitle("W tym tygodniu najlepszy był/a... Nikt?")
            .setDescription("Nikt nie dostał w tym tygodniu żadnej reakcji, więc naturalnie, wygrywam ja >:3")
        
        await meme_channel.send({ embeds: [embed] })
    }
}



/*

    scheduleJob.spec syntax:

    *    *    *    *    *    *
    ┬    ┬    ┬    ┬    ┬    ┬
    │    │    │    │    │    │
    │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
    │    │    │    │    └───── month (1 - 12)
    │    │    │    └────────── day of month (1 - 31)
    │    │    └─────────────── hour (0 - 23)
    │    └──────────────────── minute (0 - 59)
    └───────────────────────── second (0 - 59, OPTIONAL)

*/

// Weekly reset
schedule.scheduleJob("0 0 * * 1", async () => { // every monday
    // Get the scores and the entry
    const scores: ScoreEntry[] = load()

    // Display weekly best memer
    await best_memer("weekly", scores)

    // Reset the weekly scores
    for (const score of scores) {
        score.reactions.weekly = []
    }

    // Save scores to the memes.json file
    save(scores)
})

// Monthly reset
schedule.scheduleJob("0 0 1 * *", async () => { // every 1st of the month
    // Get the scores and the entry
    const scores: ScoreEntry[] = load()

    // Display monthly best memer
    await best_memer("monthly", scores)

    // Reset the monthly scores
    for (const score of scores) {
        score.reactions.monthly = []
    }

    // Save scores to the memes.json file
    save(scores)
})

// Yearly reset
schedule.scheduleJob("0 0 1 1 *", async () => { // every Jan 1st
    // Get the scores and the entry
    const scores: ScoreEntry[] = load()

    // Display yearly best memer
    await best_memer("yearly", scores)

    // Reset the yearly scores
    for (const score of scores) {
        score.reactions.yearly = []
    }

    // Save scores to the memes.json file
    save(scores)
})