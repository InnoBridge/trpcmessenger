import { 
  createTRPCClient, 
  createWSClient,
  httpBatchLink, 
  TRPCClient, 
  wsLink,
  splitLink
} from '@trpc/client';
import WebSocket from 'ws';
import { BaseEvent } from '@/models/events';

let client: TRPCClient<any> | null = null;
let wsClient: ReturnType<typeof createWSClient> | null = null; // Store wsClient reference
let httpLink: ReturnType<typeof httpBatchLink> | null = null;

const initializeTRPCClient = (url: string): void => {
  const host = url.replace(/^https?:\/\//, '');

  // Match WebSocket protocol to HTTP protocol
  const wsProtocol = url.startsWith('https://') ? 'wss://' : 'ws://';
  
  wsClient = createWSClient({
    url: `${wsProtocol}${host}/trpc`,
    WebSocket: WebSocket as any,
  });

  httpLink = httpBatchLink({
    url: `${url}/trpc`,
    headers: () => ({
      // 'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer`
    }),
  });

  client = createTRPCClient<any>({
    links: [
      splitLink({
        condition(op) {
          return op.type === 'subscription';
        },
        true: wsLink({
          client: wsClient,
        }),
        false: httpLink,
      }),
    ],
  });
};

const subscribeToEvents = (
    userId: string, 
    messageHandler: (event: BaseEvent, ack: () => void, nack: () => void) => void
): Promise<any> => {
    if (!client) {
        throw new Error('TRPC client is not initialized. Call initializeTRPCClient first.');
    }
    
    return new Promise((resolve, reject) => {
        const subscription = (client as any).events.subscribeUser.subscribe(
            { userId },
            {
                onStarted: () => {
                    console.log('Subscription established and ready');
                    resolve(subscription); // Resolve with subscription object when ready
                },
                onData: (message: any) => {
                    // Extract ACK/NACK functions from the message
                    const { _ack, _nack, ...event } = message;           
                    // Create ACK/NACK functions or use defaults
                    const ack = _ack || (() => console.log('No ACK function provided'));
                    const nack = _nack || (() => console.log('No NACK function provided'));
                    messageHandler(event, ack, nack);
                },
                onError: (error: any) => {
                    console.error('Subscription error:', error);
                    reject(error); // Reject promise on error
                },
            }
        );
    });
};


// Add cleanup function
const cleanup = async () => {
  if (wsClient) {
    await wsClient.close();
    wsClient = null;
  }
  client = null;
};

export { 
  initializeTRPCClient, 
  subscribeToEvents,
  cleanup,
  client
};