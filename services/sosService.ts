import { addDoc, collection, doc, getDocs, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { LocationData, SOSEvent } from '../redux/types';
import { db } from './firebase';

// Log SOS event to Firestore
export const logSOSEvent = async (eventData: {
  location: LocationData;
  message: string;
  timestamp: string;
  userId?: string;
}): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'sos_logs'), {
      ...eventData,
      timestamp: eventData.timestamp,
      status: 'active',
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to log SOS event');
  }
};

// Fetch SOS events from Firestore
export const fetchSOSEvents = async (limitCount: number = 50): Promise<SOSEvent[]> => {
  try {
    const q = query(
      collection(db, 'sos_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const events: SOSEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        location: data.location,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        status: data.status || 'active',
        userId: data.userId || '',
      } as SOSEvent);
    });
    
    return events;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch SOS events');
  }
};

// Update SOS event status
export const updateSOSEventStatus = async (
  eventId: string,
  status: 'active' | 'resolved' | 'false_alarm'
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'sos_logs', eventId), {
      status,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update SOS event status');
  }
};

// Get SOS statistics
export const getSOSStatistics = async (): Promise<{
  totalEvents: number;
  activeEvents: number;
  resolvedEvents: number;
  todayEvents: number;
}> => {
  try {
    const events = await fetchSOSEvents(1000); // Get more events for statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
    
    const activeEvents = events.filter(event => event.status === 'active');
    const resolvedEvents = events.filter(event => event.status === 'resolved');
    
    return {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      resolvedEvents: resolvedEvents.length,
      todayEvents: todayEvents.length,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get SOS statistics');
  }
};
