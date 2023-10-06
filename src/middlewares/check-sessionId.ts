import { FastifyReply, FastifyRequest } from 'fastify'

export const CheckIdSessionIdExist = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sessionId = request.cookies.sessionId

  console.log(sessionId)

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
