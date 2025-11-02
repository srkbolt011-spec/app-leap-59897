import { toast } from 'sonner';

interface QueuedMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
}

class OfflineManager {
  private queue: QueuedMutation[] = [];
  private storageKey = 'offline_mutation_queue';
  private isProcessing = false;

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupNetworkListener() {
    window.addEventListener('online', () => {
      toast.success('Back online! Syncing changes...');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      toast.error('You are offline. Changes will be saved and synced when connection returns.');
    });
  }

  queueMutation(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>) {
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.queue.push(queuedMutation);
    this.saveQueue();

    toast.info('Change saved. Will sync when online.');
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;

    const processedIds: string[] = [];

    for (const mutation of this.queue) {
      try {
        // Here you would implement actual sync logic based on mutation type
        console.log('Processing mutation:', mutation);
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        processedIds.push(mutation.id);
      } catch (error) {
        console.error('Failed to process mutation:', mutation, error);
        // Stop processing on first error
        break;
      }
    }

    // Remove processed mutations
    this.queue = this.queue.filter(m => !processedIds.includes(m.id));
    this.saveQueue();

    if (processedIds.length > 0) {
      toast.success(`Synced ${processedIds.length} change(s)`);
    }

    this.isProcessing = false;
  }

  getQueueLength() {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineManager = new OfflineManager();
