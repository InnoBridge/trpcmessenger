import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient
} from '@/trpc/client/api';
import {
    getConnectionRequests,
    createConnectionRequest,
    deleteConnectionRequest
} from '@/trpc/client/connections';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;
const USER1 = process.env.USER1;
const USER2 = process.env.USER2;
const NON_EXISTENT_USER = process.env.NON_EXISTENT_USER;

const createConnectionRequestNonExistentUserTest = async () => {
    console.log('Starting createConnectionRequest with non-existent user test...');
    try {
        await createConnectionRequest(USER1!, NON_EXISTENT_USER!, 'Test message');
    } catch (error: any) {
        console.error('Expected error for non-existent user:', error.message);
    }
};

const createConnectionRequestTest = async () => {
    console.log('Starting createConnectionRequest test...');
    let connectionRequest;
    try {
        connectionRequest = await createConnectionRequest(USER1!, USER2!, 'Test message');
        console.log('Connection request created successfully:', connectionRequest);
        const connectionRequests = await getConnectionRequests(USER2!);
        console.log('Connection requests for user:', USER2, connectionRequests);
        console.log('Connection request test completed successfully');
    } catch (error) {
        console.error('Failed to create connection request:', error);
        throw error;
    } finally {
        if (connectionRequest) {
            await deleteConnectionRequest(connectionRequest.requestId);
        }
    }
};


(async function main() {
        let subscription: any;
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // async tests in order
        await createConnectionRequestNonExistentUserTest();
        await createConnectionRequestTest();

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    } finally {
        // Cleanup
        // if (subscription) {
        //     console.log('🧹 Unsubscribing...');
        //     // subscription.unsubscribe();
        // }
    }
})();