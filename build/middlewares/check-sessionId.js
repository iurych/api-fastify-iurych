"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckIdSessionIdExist = void 0;
const CheckIdSessionIdExist = async (request, reply) => {
    const sessionId = request.cookies.session_id;
    if (!sessionId) {
        return reply.status(401).send({
            error: 'Unauthorized',
        });
    }
};
exports.CheckIdSessionIdExist = CheckIdSessionIdExist;
