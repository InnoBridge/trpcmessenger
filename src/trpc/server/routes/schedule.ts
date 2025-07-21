import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { eventsApi, events } from '@innobridge/scheduler';
import {
    queueApi
} from '@innobridge/qatar';
import {
    ScheduleAction,
    ScheduleEvent
} from '@/models/events';

const {
    publishScheduleEvent,
    bindSubscriberToSchedule: bindSubscriberToScheduleQuery,
    unbindSubscriberToSchedule: unbindSubscriberToScheduleQuery
} = queueApi;

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
    .query(async ({ input }): Promise<any> => {
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

const getEventsByProviderOrCustomerId = trpc.procedure
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
            const createdEvent = await createEventQuery(event);
            const scheduleEvent: ScheduleEvent = {
                type: 'schedule',
                userIds: [input.providerId],
                action: ScheduleAction.CREATE,
                eventId: createdEvent.id!
            };
            await publishScheduleEvent(scheduleEvent);
            return createdEvent;
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
            const updatedEvent = await updateEventStatusQuery(input.eventId, input.status as events.EventStatus, input.customerId, input.color);
            const scheduleEvent: ScheduleEvent = {
                type: 'schedule',
                userIds: [updatedEvent.providerId],
                action: ScheduleAction.UPDATE,
                eventId: updatedEvent.id!
            };
            await publishScheduleEvent(scheduleEvent);
            return updatedEvent;
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
    .mutation(async ({ input }): Promise<any> => {
        try {
            const deletedEvent = await deleteEventQuery(input.eventId);
            if (!deletedEvent) {
                throw new Error('Event not found');
            }
            const scheduleEvent: ScheduleEvent = {
                type: 'schedule',
                userIds: [deletedEvent.providerId],
                action: ScheduleAction.DELETE,
                eventId: deletedEvent.id!
            };
            await publishScheduleEvent(scheduleEvent);
            return deletedEvent;
        } catch (error) {
            console.error(`❌ Error deleting event:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to delete event: ${error.message}`);
            }
            throw new Error('Failed to delete event');
        }
    });

const bindSubscriberToSchedule = trpc.procedure
    .input(z.object({ 
        providerId: z.string(),
        subscriberId: z.string()
     }))
    .mutation(async ({ input }): Promise<void> => {
        try {
            await bindSubscriberToScheduleQuery(input.providerId, input.subscriberId);
        } catch (error) {
            console.error(`❌ Error binding subscriber to schedule:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to bind subscriber: ${error.message}`);
            }
            throw new Error('Failed to bind subscriber');
        }
    });

const unbindSubscriberToSchedule = trpc.procedure
    .input(z.object({
        providerId: z.string(),
        subscriberId: z.string()
    }))
    .mutation(async ({ input }): Promise<void> => {
        try {
            await unbindSubscriberToScheduleQuery(input.providerId, input.subscriberId);
        } catch (error) {
            console.error(`❌ Error unbinding subscriber from schedule:`, error);
            if (error instanceof Error) {
                throw new Error(`Failed to unbind subscriber: ${error.message}`);
            }
            throw new Error('Failed to unbind subscriber');
        }
    });

const scheduleRouter = trpc.router({
    getEventById,
    getEventsByProviderId,
    getEventsByCustomerId,
    getEventsByProviderOrCustomerId,
    createEvent,
    updateEventStatus,
    deleteEvent,
    bindSubscriberToSchedule,
    unbindSubscriberToSchedule
});

export {
    scheduleRouter
};