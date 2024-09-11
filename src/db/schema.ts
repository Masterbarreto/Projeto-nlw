
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import {createId} from "@paralleldrive/cuid2";

//serve para criar migretions para o banco de dados 

export const goals = pgTable('goals', {
  id: text('id').primaryKey().$defaultFn(()=> createId()),
  title: text('title').notNull(),
  desiredWeeklyFrequency : integer('desired_weekly_frequency').notNull(),
  createdAT: timestamp('created_at',{withTimezone: true} ).notNull().defaultNow(),
})

export const goalCompletions = pgTable('goal_Completions', {
  id: text('id').primaryKey().$defaultFn(()=> createId()),
  goalId: text('goal_id').references(()=> goals.id).notNull(),
  createdAT: timestamp('created_at',{withTimezone: true} ).notNull().defaultNow(),
})