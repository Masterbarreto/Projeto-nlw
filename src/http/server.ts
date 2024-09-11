import fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { createGoal } from "../functions/create-goal";
import { getWeekPendingGoals } from "../functions/get-week-pending-goals";
import z from 'zod'
import { sql } from "drizzle-orm";
import { createGoalCompletion } from "../functions/create-gol0completions";

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler); 

app.get('/peding-goals', async (req, res) => {
    const sql = await getWeekPendingGoals();
    return sql
})

app.post("/completions", {
    schema: {
    body: z.object({
        goalid: z.string(),
    }),
    },
},async (request) => {
    const { goalid } = request.body;

    await createGoalCompletion({
        goalid,
    });
})

app.post("/goals", {
    schema: {
    body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().min(1).max(7),
    }),
    },
},async (request) => {
    const { title, desiredWeeklyFrequency } = request.body;

    await createGoal({
        title,
        desiredWeeklyFrequency,
    });
})

app.listen({
    port: 333,
}).then(() => {
    console.log("Http server running!");
})