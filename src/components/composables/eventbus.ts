type EventCallback<T = unknown> = (data: T) => void;

interface EventMap {
  [event: string]: Set<EventCallback>;
}

const events = (new Map<string, Set<EventCallback>>()) as unknown as EventMap;

const EventBus = {
  $on<T>(event: string, callback: EventCallback<T>): void {
    let callbacks = events[event];
    if (!callbacks) {
      callbacks = new Set<EventCallback>();
      events[event] = callbacks;
    }
    callbacks.add(callback as EventCallback);
  },

  $off<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = events[event];
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
      if (callbacks.size === 0) {
        delete events[event];
      }
    }
  },

  $emit<T>(event: string, data: T): void {
    const callbacks = events[event];
    if (callbacks) {
      callbacks.forEach(callback => {
        callback(data);
      });
    }
  },

  $once<T>(event: string, callback: EventCallback<T>): void {
    const wrapper = (data: T) => {
      this.$off(event, wrapper as EventCallback<T>);
      callback(data);
    };
    this.$on(event, wrapper);
  }
};

export default EventBus;
