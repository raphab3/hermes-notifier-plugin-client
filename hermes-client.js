/**
 * Hermes Notifications - Standalone JavaScript Client
 * 
 * A lightweight, framework-agnostic JavaScript library for Hermes notifications.
 * Works with React, Vue, Angular, Django templates, or vanilla JavaScript.
 * 
 * No npm install required - just copy this file to your project!
 * 
 * @version 1.0.0
 * @author Hermes Team
 */

class HermesClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:8000';
        this.appToken = config.appToken || null;
        this.profileToken = config.profileToken || null;
        this.userId = config.userId || null;
        this.timeout = config.timeout || 30000;
        this.debug = config.debug || false;
        
        // SSE configuration
        this.sseEnabled = config.sseEnabled !== false;
        this.reconnectDelay = config.reconnectDelay || 5000;
        this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
        
        // Internal state
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.listeners = {
            notification: [],
            connected: [],
            disconnected: [],
            error: [],
            unreadCount: []
        };
        
        this.log('HermesClient initialized', config);
    }
    
    /**
     * Internal logging
     */
    log(...args) {
        if (this.debug) {
            console.log('[HermesClient]', ...args);
        }
    }
    
    /**
     * Send a notification
     */
    async sendNotification(options = {}) {
        const {
            userId,
            title,
            body,
            sourceSystem = 'web-app',
            priority = 'normal',
            channels = ['in_app'],
            metadata = {}
        } = options;
        
        if (!userId) {
            throw new Error('userId is required');
        }
        
        if (!title || !body) {
            throw new Error('title and body are required');
        }
        
        const token = this.appToken;
        if (!token) {
            throw new Error('appToken is required for sending notifications');
        }
        
        this.log('Sending notification', options);
        
        const response = await fetch(`${this.baseUrl}/api/notifications/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                title,
                body,
                source_system: sourceSystem,
                priority,
                channels,
                metadata
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        this.log('Notification sent', result);
        return result;
    }
    
    /**
     * Get notifications for a user
     */
    async getNotifications(options = {}) {
        const {
            userId = this.userId,
            isRead = null,
            limit = 20,
            offset = 0
        } = options;
        
        if (!userId) {
            throw new Error('userId is required');
        }
        
        const token = this.profileToken || this.appToken;
        if (!token) {
            throw new Error('profileToken or appToken is required');
        }
        
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });
        
        if (isRead !== null) {
            params.append('is_read', isRead.toString());
        }
        
        this.log('Getting notifications', { userId, params: params.toString() });
        
        const response = await fetch(
            `${this.baseUrl}/api/notifications/user/${userId}?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        this.log('Notifications received', result);
        return result;
    }
    
    /**
     * Get unread count
     */
    async getUnreadCount(userId = this.userId) {
        if (!userId) {
            throw new Error('userId is required');
        }
        
        const token = this.profileToken || this.appToken;
        if (!token) {
            throw new Error('profileToken or appToken is required');
        }
        
        this.log('Getting unread count', userId);
        
        const response = await fetch(
            `${this.baseUrl}/api/notifications/user/${userId}/unread-count`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        this.log('Unread count', result);
        return result.count || 0;
    }
    
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        if (!notificationId) {
            throw new Error('notificationId is required');
        }
        
        const token = this.profileToken || this.appToken;
        if (!token) {
            throw new Error('profileToken or appToken is required');
        }
        
        this.log('Marking as read', notificationId);
        
        const response = await fetch(
            `${this.baseUrl}/api/notifications/${notificationId}/read`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        this.log('Marked as read', result);
        return result;
    }
    
    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId = this.userId) {
        if (!userId) {
            throw new Error('userId is required');
        }
        
        const token = this.profileToken || this.appToken;
        if (!token) {
            throw new Error('profileToken or appToken is required');
        }
        
        this.log('Marking all as read', userId);
        
        const response = await fetch(
            `${this.baseUrl}/api/notifications/user/${userId}/read-all`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        this.log('All marked as read', result);
        return result;
    }
    
    /**
     * Connect to SSE for real-time notifications
     */
    connectSSE(userId = this.userId) {
        if (!userId) {
            throw new Error('userId is required for SSE connection');
        }
        
        const token = this.profileToken;
        if (!token) {
            throw new Error('profileToken is required for SSE connection');
        }
        
        if (this.eventSource) {
            this.log('SSE already connected, disconnecting first');
            this.disconnectSSE();
        }
        
        const sseUrl = `${this.baseUrl}/sse/notifications/${userId}/?token=${token}`;
        this.log('Connecting to SSE', sseUrl);
        
        this.eventSource = new EventSource(sseUrl);
        
        this.eventSource.onopen = () => {
            this.log('SSE connection opened');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected', { userId });
        };
        
        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.log('SSE message received', data);
                
                if (data.type === 'notification') {
                    this.emit('notification', data);
                } else if (data.type === 'unread_count') {
                    this.emit('unreadCount', data.count);
                } else if (data.type === 'connected') {
                    this.emit('connected', data);
                }
            } catch (error) {
                this.log('Error parsing SSE message', error);
            }
        };
        
        this.eventSource.onerror = (error) => {
            this.log('SSE error', error);
            this.isConnected = false;
            this.emit('error', error);
            this.emit('disconnected', { reason: 'error' });

            // Auto-reconnect
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                this.log(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);
                setTimeout(() => this.connectSSE(userId), this.reconnectDelay);
            } else {
                this.log('Max reconnect attempts reached');
            }
        };
    }

    /**
     * Disconnect from SSE
     */
    disconnectSSE() {
        if (this.eventSource) {
            this.log('Disconnecting SSE');
            this.eventSource.close();
            this.eventSource = null;
            this.isConnected = false;
            this.emit('disconnected', { reason: 'manual' });
        }
    }

    /**
     * Event listener management
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        this.log(`Listener added for event: ${event}`);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;

        const index = this.listeners[event].indexOf(callback);
        if (index > -1) {
            this.listeners[event].splice(index, 1);
            this.log(`Listener removed for event: ${event}`);
        }
    }

    emit(event, data) {
        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                this.log(`Error in ${event} listener`, error);
            }
        });
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            hasEventSource: !!this.eventSource
        };
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HermesClient;
}
if (typeof window !== 'undefined') {
    window.HermesClient = HermesClient;
}

