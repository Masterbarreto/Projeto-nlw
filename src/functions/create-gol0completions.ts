
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, lte, sql, count } from "drizzle-orm";
import { gte , eq} from "drizzle-orm";
import { number } from "zod";


interface createGoalCompletionRequest{
    goalid: string
}

export async function createGoalCompletion({
    goalid
}: createGoalCompletionRequest){
    const firstDayOfWeek = dayjs().startOf("week").toDate();
    const lastDayOfWeek = dayjs().endOf("week").toDate();

    const goalCompletionCounts = db.$with("goal_Completion_Counts").as(
        db.select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
        })
        .from(goalCompletions)
        .where(
            and(
            gte(goalCompletions.createdAT, firstDayOfWeek), 
            lte(goalCompletions.createdAT, lastDayOfWeek),
            eq(goalCompletions.goalId, goalid)
        )
    ) 
        .groupBy(goalCompletions.goalId)
    );


    const result = await db
    .with(goalCompletionCounts)
    .select({
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        completionCount: sql `
        COALESCE(${goalCompletionCounts.completionCount}, 0)`
        .mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalid))
    .limit(1)

    const {completionCount, desiredWeeklyFrequency}= result[0]

    if(completionCount>= desiredWeeklyFrequency){
        throw new Error("Goal already completion this week!")
    }

    const insertResult = await db.insert(goalCompletions).values({ goalId: goalid }).returning()
    const goalCompletion = insertResult[0]

    return {
        goalCompletion
    }
     
} 