/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { CheckIdSessionIdExist } from '../middlewares/check-sessionId'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get(
    '/',
    {
      preHandler: [CheckIdSessionIdExist],
    },
    async (request) => {
      const sessionId = request.cookies.session_id

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return {
        transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [CheckIdSessionIdExist],
    },
    async (request) => {
      const allTransactionsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = allTransactionsSchema.parse(request.params)
      const sessionId = request.cookies.session_id

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [CheckIdSessionIdExist],
    },
    async (request) => {
      const sessionId = request.cookies.session_id

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post('/', async (request, reply) => {
    const createBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { amount, title, type } = createBodySchema.parse(request.body)

    let sessionId = request.cookies.session_id

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('session_id', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
