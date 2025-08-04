import { trpc } from '@/trpc/server/trpc';
import {
    usersApi
} from '@innobridge/usermanagement';
import { z } from 'zod';

const { 
    getUserByUsername: getUserByUsernameApi,
    getUserById: getUserByIdApi,
} = usersApi;

const getUserByUsername = trpc.procedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }): Promise<any> => {
        const result = await getUserByUsernameApi(input.username);
        if (!result) {
            return null;
        }
        const user = {
            id: result.id,
            username: result.username,
            firstName: result.firstName,
            lastName: result.lastName,
            emailAddresses: result.emailAddresses,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        };
        return user;
});

const getUserById = trpc.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }): Promise<any> => {
        const result = await getUserByIdApi(input.id);
        if (!result) {
            return null;
        }
        const user = {
            id: result.id,
            username: result.username,
            firstName: result.firstName,
            lastName: result.lastName,
            emailAddresses: result.emailAddresses,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        };
        return user;
});

const usersRouter = trpc.router({
    getUserByUsername: getUserByUsername,
    getUserById: getUserById
});

export { 
    usersRouter 
};