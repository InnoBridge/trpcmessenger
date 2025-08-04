import { client } from '@/trpc/client/api';
import { user } from '@innobridge/usermanagement';

const getUserByUsername = async (username: string): Promise<user.User | null> => {
    return await (client as any).users.getUserByUsername.query({ username });
};

const getUserById = async (id: string): Promise<user.User | null> => {
    return await (client as any).users.getUserById.query({ id });
}

export {
    getUserByUsername,
    getUserById
};