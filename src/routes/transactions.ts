/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { CheckIdSessionIdExist } from '../middlewares/check-sessionId'

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    console.log(`${request.method}`)
  })

  app.get(
    '/',
    {
      preHandler: [CheckIdSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('sessionId', sessionId)
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
      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
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
      const { sessionId } = request.cookies

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

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
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
