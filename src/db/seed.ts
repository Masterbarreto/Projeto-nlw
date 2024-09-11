// sereve para salvar paramatros de daados padarão 

import { db , client } from "."
import { goalCompletions, goals } from "./schema"
import dayjs from "dayjs"

async function seed(){
    await db.delete(goalCompletions)
    await db.delete(goals)

    const result = await db.insert(goals).values([
        { title: "Learn to code", desiredWeeklyFrequency: 3},
        { title: "Dormir cedo", desiredWeeklyFrequency: 5},
        { title: "meditar cedo", desiredWeeklyFrequency: 5}
    ]).returning()

    const startOfWeek = dayjs().startOf("week")

    await db.insert(goalCompletions).values([
        {goalId: result[0].id, createdAT: startOfWeek.toDate()},
        {goalId: result[1].id, createdAT: startOfWeek.add(1,"day").toDate()},
    ])
}

seed().finally(() =>{
    client.end()
})