/**
 * EventBus - Central pub/sub system for decoupled communication
 * Allows systems to communicate without direct dependencies
 */

import { EventCallback, EventPayloads, GameEvent } from './events';

type Subscriber = {
  callback: Function;
  once: boolean;
};

export class EventBus {
  private subscribers: Map<GameEvent, Subscriber[]> = new Map();
  private static instance: EventBus;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  on<T extends GameEvent>(event: T, callback: EventCallback<T>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    const subscriber: Subscriber = {
      callback: callback as Function,
      once: false
    };

    this.subscribers.get(event)!.push(subscriber);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   */
  once<T extends GameEvent>(event: T, callback: EventCallback<T>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    const subscriber: Subscriber = {
      callback: callback as Function,
      once: true
    };

    this.subscribers.get(event)!.push(subscriber);

    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends GameEvent>(event: T, callback: EventCallback<T>): void {
    const subscribers = this.subscribers.get(event);
    if (!subscribers) return;

    const index = subscribers.findIndex(sub => sub.callback === callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  }

  /**
   * Emit an event with payload
   */
  emit<T extends GameEvent>(event: T, payload: EventPayloads[T]): void {
    const subscribers = this.subscribers.get(event);
    if (!subscribers || subscribers.length === 0) return;

    // Create a copy to avoid issues if subscribers modify the array
    const subscribersCopy = [...subscribers];

    subscribersCopy.forEach(subscriber => {
      try {
        subscriber.callback(payload);

        // Remove one-time subscribers
        if (subscriber.once) {
          this.off(event, subscriber.callback as any);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Clear all subscribers for an event
   */
  clear(event?: GameEvent): void {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }

  /**
   * Get subscriber count for debugging
   */
  getSubscriberCount(event: GameEvent): number {
    return this.subscribers.get(event)?.length || 0;
  }

  /**
   * Get all active events for debugging
   */
  getActiveEvents(): GameEvent[] {
    return Array.from(this.subscribers.keys());
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
