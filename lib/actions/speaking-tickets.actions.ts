'use server'

import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';

export interface SpeakingTicket {
  userId: string;
  date: string; // YYYY-MM-DD format
  testsUsed: number;
  maxTests: number;
  lastTestAt?: Date;
}

export interface TicketStatus {
  hasTickets: boolean;
  remainingTickets: number;
  maxTickets: number;
  nextResetDate: string;
}

// Get current user from session cookie
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get tomorrow's date for reset info
function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Get or create speaking ticket record for today
export async function getSpeakingTicketStatus(): Promise<TicketStatus | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const today = getTodayString();
    const ticketRef = db.collection('speaking_tickets').doc(`${user.uid}_${today}`);
    const ticketDoc = await ticketRef.get();

    let ticket: SpeakingTicket;

    if (!ticketDoc.exists) {
      // Create new ticket record for today
      ticket = {
        userId: user.uid,
        date: today,
        testsUsed: 0,
        maxTests: 1, // One free test per day
      };
      
      await ticketRef.set(ticket);
    } else {
      ticket = ticketDoc.data() as SpeakingTicket;
    }

    return {
      hasTickets: ticket.testsUsed < ticket.maxTests,
      remainingTickets: Math.max(0, ticket.maxTests - ticket.testsUsed),
      maxTickets: ticket.maxTests,
      nextResetDate: getTomorrowString(),
    };
  } catch (error) {
    console.error('Error getting speaking ticket status:', error);
    return null;
  }
}

// Use a speaking test ticket
export async function useSpeakingTicket(): Promise<{ success: boolean; message: string; remainingTickets?: number }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    const today = getTodayString();
    const ticketRef = db.collection('speaking_tickets').doc(`${user.uid}_${today}`);
    
    // Use transaction to prevent race conditions
    const result = await db.runTransaction(async (transaction) => {
      const ticketDoc = await transaction.get(ticketRef);
      
      let ticket: SpeakingTicket;
      
      if (!ticketDoc.exists) {
        // Create new ticket record
        ticket = {
          userId: user.uid,
          date: today,
          testsUsed: 0,
          maxTests: 1,
        };
      } else {
        ticket = ticketDoc.data() as SpeakingTicket;
      }

      // Check if user has tickets remaining
      if (ticket.testsUsed >= ticket.maxTests) {
        return {
          success: false,
          message: 'No tickets remaining for today. Please come back tomorrow.',
          remainingTickets: 0,
        };
      }

      // Use one ticket
      ticket.testsUsed += 1;
      ticket.lastTestAt = new Date();

      // Update the document
      transaction.set(ticketRef, ticket);

      return {
        success: true,
        message: 'Ticket used successfully',
        remainingTickets: ticket.maxTests - ticket.testsUsed,
      };
    });

    return result;
  } catch (error) {
    console.error('Error using speaking ticket:', error);
    return {
      success: false,
      message: 'Failed to use ticket. Please try again.',
    };
  }
}

// Get user's speaking test history (optional - for analytics)
export async function getSpeakingTestHistory(limit: number = 10) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const historyQuery = db
      .collection('speaking_tickets')
      .where('userId', '==', user.uid)
      .orderBy('date', 'desc')
      .limit(limit);

    const snapshot = await historyQuery.get();
    const history = snapshot.docs.map(doc => doc.data() as SpeakingTicket);

    return history;
  } catch (error) {
    console.error('Error getting speaking test history:', error);
    return null;
  }
}

// Check if user is authenticated (helper function)
export async function checkAuthentication(): Promise<{ isAuthenticated: boolean; user?: any }> {
  try {
    const user = await getCurrentUser();
    return {
      isAuthenticated: !!user,
      user: user || undefined,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
    };
  }
}