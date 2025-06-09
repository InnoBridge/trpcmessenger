import * as trpcExpressAdapter from '@/trpc/server/handler';
import { WebSocket } from 'ws';
import * as api from '@/trpc/client/api';
import * as usersApi from '@/trpc/client/users';
import * as messagesApi from '@/trpc/client/messages';
import * as connectionsApi from '@/trpc/client/connections';

export {
    trpcExpressAdapter,
    WebSocket,
    api,
    usersApi,
    messagesApi,
    connectionsApi
};
