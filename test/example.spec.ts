import { expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

test('O usuário pode criar uma nova transação', async () => {
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })
    .expect(201)
})
