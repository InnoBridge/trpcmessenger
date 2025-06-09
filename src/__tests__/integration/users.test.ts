import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient
} from '@/trpc/client/api';
import {
    getUserByUsername
} from '@/trpc/client/users';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;
const USERNAME = process.env.USERNAME;

const getUserByUsernameTest = async () => {
    console.log('Starting getUserByUsernameTest test...');
    try {
        const user = await getUserByUsername(USERNAME!);
        console.log('User retrieved successfully:', JSON.stringify(user, null, 2));
        console.log('Get user by username test completed successfully');
    } catch (error) {
        console.error('Failed to get user by username:', error);
        throw error;
    }
};


(async function main() {
        let subscription: any;
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // async tests in order
        await getUserByUsernameTest();

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();