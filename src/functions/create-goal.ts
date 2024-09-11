import { goals } from "../db/schema"
import { db } from "../db"

interface CreateGoalRequest{
    tiltle: string
    desiredWeeklyFrequency: number
}

export async function createGoal({tiltle,desiredWeeklyFrequency}:CreateGoalRequest ){
const result = await  db.insert(goals).values({
    title: tiltle,
    desiredWeeklyFrequency,
}).returning()

const goal = result[0]

return {
    goal,
}
}