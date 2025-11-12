/**
 * React Example - Using HermesClient standalone library
 * 
 * Just copy hermes-client.js to your public folder and use it!
 * No npm install needed.
 */

import { useEffect, useState, useCallback } from 'react';

// HermesClient is loaded from public/hermes-client.js via script tag in index.html
// <script src="/hermes-client.js"></script>

function NotificationsApp() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [hermesClient, setHermesClient] = useState(null);
    
    // Configuration
    const config = {
        baseUrl: 'http://localhost:8000',
        profileToken: 'your-profile-token-here',
        userId: 'user-123',
        debug: true
    };
    
    useEffect(() => {
        // Initialize HermesClient
        const client = new window.HermesClient(config);
        
        // Listen for notifications
        client.on('notification', (notification) => {
            console.log('New notification:', notification);
            setNotifications(prev => [notification, ...prev]);
            
            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.body,
                    icon: '/notification-icon.png'
                });
            }
        });
        
        // Listen for connection events
        client.on('connected', () => {
            console.log('Connected to Hermes');
            setIsConnected(true);
        });
        
        client.on('disconnected', () => {
            console.log('Disconnected from Hermes');
            setIsConnected(false);
        });
        
        client.on('unreadCount', (count) => {
            console.log('Unread count:', count);
            setUnreadCount(count);
        });
        
        // Connect to SSE
        client.connectSSE();
        
        // Load existing notifications
        client.getNotifications({ limit: 50 })
            .then(result => {
                setNotifications(result.results || []);
            })
            .catch(error => {
                console.error('Error loading notifications:', error);
            });
        
        // Get unread count
        client.getUnreadCount()
            .then(count => {
                setUnreadCount(count);
            })
            .catch(error => {
                console.error('Error getting unread count:', error);
            });
        
        setHermesClient(client);
        
        // Cleanup
        return () => {
            client.disconnectSSE();
        };
    }, []);
    
    const markAsRead = useCallback(async (notificationId) => {
        if (!hermesClient) return;
        
        try {
            await hermesClient.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }, [hermesClient]);
    
    const markAllAsRead = useCallback(async () => {
        if (!hermesClient) return;
        
        try {
            await hermesClient.markAllAsRead();
            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [hermesClient]);
    
    const sendTestNotification = useCallback(async () => {
        if (!hermesClient) return;
        
        try {
            await hermesClient.sendNotification({
                userId: config.userId,
                title: 'Test Notification',
                body: 'This is a test notification from React',
                priority: 'normal',
                channels: ['in_app']
            });
            alert('Notification sent!');
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Error sending notification: ' + error.message);
        }
    }, [hermesClient]);
    
    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        🔔 Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        
                        <button
                            onClick={sendTestNotification}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Send Test
                        </button>
                        
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`border rounded-lg p-4 ${
                                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">
                                            {notification.title}
                                        </h3>
                                        <p className="text-gray-700 mt-1">
                                            {notification.body}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span>
                                                Priority: {notification.priority || 'normal'}
                                            </span>
                                            <span>
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationsApp;

