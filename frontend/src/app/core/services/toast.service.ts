import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(type: 'success' | 'error' | 'info', message: string, durationMs = 3000) {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, type, message };

        this.toasts.update(current => [...current, toast]);

        if (durationMs > 0) {
            setTimeout(() => {
                this.remove(id);
            }, durationMs);
        }
    }

    success(message: string, durationMs = 3000) {
        this.show('success', message, durationMs);
    }

    error(message: string, durationMs = 5000) {
        this.show('error', message, durationMs);
    }

    info(message: string, durationMs = 3000) {
        this.show('info', message, durationMs);
    }

    remove(id: string) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }
}
