import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { eventsApi, events } from '@innobridge/scheduler';

const {
    getEventById: getEventByIdQuery,
    getEventsByProvider,
    getEventsByCustomer,
    getEventsByProviderOrCustomer,
    createEvent: createEventQuery,
    updateEventStatus: updateEventStatusQuery,
    deleteEvent: deleteEventQuery
} = eventsApi;

const getEventById = trpc.procedure
    .input(z.object({ eventId: z.string() }))   
    .query(async ({ input }): Promise<events.Event | null> => {
        return await getEventByIdQuery(input.eventId);
    });

const getEventsByProviderId = trpc.procedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }): Promise<any> => {
        return await getEventsByProvider(input.providerId);
    });

const getEventsByCustomerId = trpc.procedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }): Promise<any> => {
        return await getEventsByCustomer(input.customerId);
    });

const getEventByProviderOrCustomerId = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }): Promise<any> => {
        return await getEventsByProviderOrCustomer(input.userId);
    });

const createEvent = trpc.procedure
    .input(z.object({
        id: z.string().optional(),
        start: z.string(),
        end: z.string(),
        title: z.string(),
        summary: z.string().optional(),
        color: z.string().optional(),
        status: z.enum(['vacant', 'booked', 'fulfilled', 'cancelled']),
        providerId: z.string(), 
        customerId: z.string().optional()
    }))
    .mutation(async ({ input }): Promise<any> => {
        try {
            const event = {
                id: input.id,
                start: input.start,
                end: input.end,
                title: input.title,
                summary: input.summary,
                color: input.color,
                status: input.status,
                providerId: input.providerId,
                customerId: input.customerId
            } as events.Event;
            return await createEventQuery(event);
        } catch (error) {
            console.error(`❌ Error creating event:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to create event: ${error.message}`);
            }
            throw new Error('Failed to create event');
        }
    });

const updateEventStatus = trpc.procedure
    .input(z.object({
        eventId: z.string(),
        status: z.enum(['vacant', 'booked', 'fulfilled', 'cancelled']),
        customerId: z.string().optional(),
        color: z.string().optional()
    }))
    .mutation(async ({ input }): Promise<any> => {
        try {
            return await updateEventStatusQuery(input.eventId, input.status as events.EventStatus, input.customerId, input.color);
        } catch (error) {
            console.error(`❌ Error updating event status:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to update event status: ${error.message}`);
            }
            throw new Error('Failed to update event status');
        }
    });

const deleteEvent = trpc.procedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input }): Promise<void> => {
        try {
            await deleteEventQuery(input.eventId);
        } catch (error) {
            console.error(`❌ Error deleting event:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to delete event: ${error.message}`);
            }
            throw new Error('Failed to delete event');
        }
    });

const scheduleRouter = trpc.router({
    getEventById,
    getEventsByProviderId,
    getEventsByCustomerId,
    getEventByProviderOrCustomerId,
    createEvent,
    updateEventStatus,
    deleteEvent
});

export {
    scheduleRouter
};