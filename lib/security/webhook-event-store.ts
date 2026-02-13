/**
 * Webhook event deduplication and replay attack prevention
 * Stores processed webhook event IDs to prevent duplicate processing
 */

interface ProcessedEvent {
  eventId: string;
  processedAt: number;
  eventType: string;
}

class WebhookEventStore {
  private processedEvents: Map<string, ProcessedEvent> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Cleanup old events periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Check if an event has already been processed
   * @param eventId - Stripe event ID
   * @param eventType - Type of the event
   * @param eventCreatedTimestamp - When the event was created (Unix timestamp)
   * @returns true if event is new and should be processed
   */
  shouldProcess(
    eventId: string,
    eventType: string,
    eventCreatedTimestamp: number
  ): {
    shouldProcess: boolean;
    reason?: string;
  } {
    // Check if event is too old (potential replay attack)
    const eventAge = Date.now() - eventCreatedTimestamp * 1000;
    if (eventAge > this.MAX_AGE_MS) {
      return {
        shouldProcess: false,
        reason: `Event is too old: ${Math.floor(eventAge / 1000 / 60)} minutes old`,
      };
    }

    // Check if already processed
    const existing = this.processedEvents.get(eventId);
    if (existing) {
      return {
        shouldProcess: false,
        reason: `Event already processed at ${new Date(existing.processedAt).toISOString()}`,
      };
    }

    return { shouldProcess: true };
  }

  /**
   * Mark an event as processed
   */
  markProcessed(eventId: string, eventType: string): void {
    this.processedEvents.set(eventId, {
      eventId,
      processedAt: Date.now(),
      eventType,
    });
  }

  /**
   * Remove old processed events to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.MAX_AGE_MS;

    let removedCount = 0;
    for (const [eventId, event] of this.processedEvents.entries()) {
      if (event.processedAt < cutoff) {
        this.processedEvents.delete(eventId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(
        `[WebhookEventStore] Cleaned up ${removedCount} old events. Current size: ${this.processedEvents.size}`
      );
    }
  }

  /**
   * Get statistics about processed events
   */
  getStats(): {
    totalProcessed: number;
    oldestEvent: string | null;
    newestEvent: string | null;
  } {
    if (this.processedEvents.size === 0) {
      return {
        totalProcessed: 0,
        oldestEvent: null,
        newestEvent: null,
      };
    }

    let oldest: ProcessedEvent | null = null;
    let newest: ProcessedEvent | null = null;

    for (const event of this.processedEvents.values()) {
      if (!oldest || event.processedAt < oldest.processedAt) {
        oldest = event;
      }
      if (!newest || event.processedAt > newest.processedAt) {
        newest = event;
      }
    }

    return {
      totalProcessed: this.processedEvents.size,
      oldestEvent: oldest ? new Date(oldest.processedAt).toISOString() : null,
      newestEvent: newest ? new Date(newest.processedAt).toISOString() : null,
    };
  }

  /**
   * Clear all processed events (for testing)
   */
  clear(): void {
    this.processedEvents.clear();
  }

  /**
   * Destroy the store and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.processedEvents.clear();
  }
}

// Singleton instance
export const webhookEventStore = new WebhookEventStore();

/**
 * Helper function to create event processing guard
 */
export function createEventGuard(eventId: string, eventType: string, created: number) {
  const check = webhookEventStore.shouldProcess(eventId, eventType, created);

  return {
    shouldProcess: check.shouldProcess,
    reason: check.reason,
    markProcessed: () => webhookEventStore.markProcessed(eventId, eventType),
  };
}
