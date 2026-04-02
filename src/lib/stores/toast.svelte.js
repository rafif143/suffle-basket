export const toast = createToastStore();

function createToastStore() {
    let toasts = $state([]);

    return {
        get current() { return toasts; },
        
        show(message, type = 'success', duration = 3000) {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast = { id, message, type };
            toasts = [...toasts, newToast];

            if (duration > 0) {
                setTimeout(() => {
                    this.remove(id);
                }, duration);
            }
            return id;
        },

        success(message, duration) {
            return this.show(message, 'success', duration);
        },

        error(message, duration) {
            return this.show(message, 'error', duration);
        },

        info(message, duration) {
            return this.show(message, 'info', duration);
        },

        remove(id) {
            toasts = toasts.filter(t => t.id !== id);
        }
    };
}
