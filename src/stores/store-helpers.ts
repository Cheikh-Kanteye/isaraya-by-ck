/* eslint-disable @typescript-eslint/no-explicit-any */
type EventListener = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, EventListener[]> = {};

  on(event: string, listener: EventListener): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    // Return a function to unsubscribe
    return () => {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    };
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args));
    }
  }
}

export const storeObserver = new EventEmitter();
