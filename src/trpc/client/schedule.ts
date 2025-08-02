import { client } from '@/trpc/client/api';
import { events } from '@innobridge/scheduler';

const getEventById = async (eventId: string): Promise<events.Event | null> => {
    return await (client as any).schedule.getEventById.query({ eventId });
};

const getEventsByProviderId = async (providerId: string): Promise<events.Event[]> => {
    return await (client as any).schedule.getEventsByProviderId.query({ providerId });
};

const getEventsByCustomerId = async (customerId: string): Promise<events.Event[]> => {
    return await (client as any).schedule.getEventsByCustomerId.query({ customerId });
};

const getEventsByProviderOrCustomerId = async (userId: string): Promise<events.Event | null> => {
    return await (client as any).schedule.getEventsByProviderOrCustomerId.query({ userId });
};

const createEvent = async (event: events.Event): Promise<events.Event> => {
    return await (client as any).schedule.createEvent.mutate(event);
};

const updateEventStatus = async (eventId: string, status: events.EventStatus): Promise<events.Event> => {
    return await (client as any).schedule.updateEventStatus.mutate({ eventId, status });
};

const updateEventStatusAndColor = async (eventId: string, status: events.EventStatus, color: string): Promise<events.Event> => {
    return await (client as any).schedule.updateEventStatusAndColor.mutate({ eventId, status, color });
};

const updateEventStatusAndCustomerId = async (eventId: string, status: events.EventStatus, customerId: string): Promise<events.Event> => {
    return await (client as any).schedule.updateEventStatusAndCustomerId.mutate({ eventId, status, customerId });
};

const updateEventStatusWithColorAndCustomerId = async (eventId: string, status: events.EventStatus, color: string, customerId: string): Promise<events.Event> => {
    return await (client as any).schedule.updateEventStatusWithColorAndCustomerId.mutate({ eventId, status, color, customerId });
};

const deleteEvent = async (eventId: string): Promise<void> => {
    return await (client as any).schedule.deleteEvent.mutate({ eventId });
};

const bindSubscriberToSchedule = (
    providerId: string,
    subscriberId: string
): Promise<void> => {
    return (client as any).schedule.bindSubscriberToSchedule.mutate({ providerId, subscriberId });
};

const unbindSubscriberToSchedule = (
    providerId: string,
    subscriberId: string
): Promise<void> => {
    return (client as any).schedule.unbindSubscriberToSchedule.mutate({ providerId, subscriberId });
};

export {
    getEventById,
    getEventsByProviderId,
    getEventsByCustomerId,
    getEventsByProviderOrCustomerId,
    createEvent,
    updateEventStatus,
    updateEventStatusAndColor,
    updateEventStatusAndCustomerId,
    updateEventStatusWithColorAndCustomerId,
    deleteEvent,
    bindSubscriberToSchedule,
    unbindSubscriberToSchedule
};
