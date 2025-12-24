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
schedule.scheduleJob("0 0 * * 1", () => { // every monday
    // Get the scores and the entry
    const scores: ScoreEntry[] = load()

    // Reset the weekly scores
    for (const score of scores) {
        score.reactions.weekly = []
    }

    // Save scores to the memes.json file
    save(scores)
})

// Monthly reset
schedule.scheduleJob("0 0 1 * *", () => { // every 1st of the month
    // Get the scores and the entry
    const scores: ScoreEntry[] = load()

    // Reset the monthly scores
    for (const score of scores) {
        score.reactions.monthly = []
    }

    // Save scores to the memes.json file
    save(scores)
})

// Yearly reset
schedule.scheduleJob("0 0 1 1 *", () => { // every Jan 1st
    // Get the scores and the entry
    const scores: ScoreEntry[] = load()

    // Reset the yearly scores
    for (const score of scores) {
        score.reactions.yearly = []
    }

    // Save scores to the memes.json file
    save(scores)
})