import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, lte, sql, count } from "drizzle-orm";
import { gte , eq} from "drizzle-orm";
import { number } from "zod";


dayjs.extend(weekOfYear);

export async function getWeekPendingGoals() {
const firstDayOfWeek = dayjs().startOf("week").toDate();
const lastDayOfWeek = dayjs().endOf("week").toDate();

const goalsCreatedUpToWeek = db.$with("goals_Create_UP_To_week").as(
    db.select({
    id: goals.id,
    title: goals.title,
    desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
    createdAT: goals.createdAT,
    }).from(goals).where(lte(goals.createdAT, lastDayOfWeek))
);

const goalCompletionCounts = db.$with("goal_Completion_Counts").as(
    db.select({
    goalId: goalCompletions.goalId,
    completionCount: count(goalCompletions.id).as('completionCount'),
    })
    .from(goalCompletions)
    .where(and(
        gte(goalCompletions.createdAT, lastDayOfWeek), 
        lte(goalCompletions.createdAT, lastDayOfWeek))) 
    .groupBy(goalCompletions.goalId)
);

const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
        id: goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        completionCount: sql`
        COALESCE(${goalCompletionCounts.completionCount}, 0)`.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek))

    return pendingGoals;
}