# 🚀 Hermes Client - Standalone JavaScript

**Framework-agnostic JavaScript library for Hermes notifications**

✅ No npm install required
✅ Works with React, Vue, Angular, Django, vanilla JS
✅ Use via CDN or copy locally
✅ Only 5.5KB minified!

---

## 📦 Installation

### Option 1: npm (Recommended)
```bash
npm install @hermes-notifications/client
```

Then use via CDN (automatically available):
```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>

<!-- Specific version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client@1.0.0"></script>

<!-- Unminified for development -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client/hermes-client.js"></script>
```

### Option 2: CDN only (no npm install)
```html
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>
```

### Option 3: Copy the file
```bash
# Copy to your project
cp hermes-client.js /path/to/your/project/static/js/
```

### Option 4: Download
```bash
# Download minified version
curl -o hermes-client.min.js https://cdn.jsdelivr.net/npm/@hermes-notifications/client
```

---

## ⚡ Quick Start

### Vanilla JavaScript / Django Templates

```html
<!DOCTYPE html>
<html>
<head>
    <title>Hermes Notifications</title>
    <!-- Load from CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>
</head>
<body>
    <div id="notifications"></div>

    <script>
        // Initialize client (HermesClient is now available globally)
        const hermes = new HermesClient({
            baseUrl: 'http://localhost:8000',
            appToken: 'your-app-token',
            profileToken: 'your-profile-token',
            userId: 'user-123',
            debug: true
        });

        // Listen for notifications
        hermes.on('notification', (notification) => {
            console.log('New notification:', notification);
            // Display notification in your UI
            document.getElementById('notifications').innerHTML +=
                `<div>${notification.title}: ${notification.body}</div>`;
        });

        // Connect to real-time notifications
        hermes.connectSSE();

        // Send a notification
        hermes.sendNotification({
            userId: 'user-456',
            title: 'Hello!',
            body: 'This is a test notification',
            priority: 'normal',
            channels: ['in_app', 'email']
        });
    </script>
</body>
</html>
```

### React

```jsx
import { useEffect, useState } from 'react';

function App() {
    const [notifications, setNotifications] = useState([]);
    const [hermes] = useState(() => new HermesClient({
        baseUrl: 'http://localhost:8000',
        profileToken: 'your-profile-token',
        userId: 'user-123'
    }));
    
    useEffect(() => {
        // Listen for notifications
        hermes.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
        });
        
        // Connect to SSE
        hermes.connectSSE();
        
        // Load existing notifications
        hermes.getNotifications().then(data => {
            setNotifications(data.results || []);
        });
        
        // Cleanup
        return () => {
            hermes.disconnectSSE();
        };
    }, []);
    
    return (
        <div>
            <h1>Notifications ({notifications.length})</h1>
            {notifications.map(n => (
                <div key={n.id}>
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                </div>
            ))}
        </div>
    );
}
```

### Vue

```vue
<template>
    <div>
        <h1>Notifications ({{ notifications.length }})</h1>
        <div v-for="n in notifications" :key="n.id">
            <h3>{{ n.title }}</h3>
            <p>{{ n.body }}</p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            notifications: [],
            hermes: null
        };
    },
    mounted() {
        this.hermes = new HermesClient({
            baseUrl: 'http://localhost:8000',
            profileToken: 'your-profile-token',
            userId: 'user-123'
        });
        
        this.hermes.on('notification', (notification) => {
            this.notifications.unshift(notification);
        });
        
        this.hermes.connectSSE();
        
        this.hermes.getNotifications().then(data => {
            this.notifications = data.results || [];
        });
    },
    beforeUnmount() {
        this.hermes?.disconnectSSE();
    }
};
</script>
```

---

## 📚 API Reference

### Constructor

```javascript
const hermes = new HermesClient({
    baseUrl: 'http://localhost:8000',      // Hermes server URL
    appToken: 'your-app-token',            // For sending notifications
    profileToken: 'your-profile-token',    // For receiving notifications
    userId: 'user-123',                    // Default user ID
    debug: true,                           // Enable debug logs
    reconnectDelay: 5000,                  // SSE reconnect delay (ms)
    maxReconnectAttempts: 10               // Max SSE reconnect attempts
});
```

### Methods

#### `sendNotification(options)`
```javascript
await hermes.sendNotification({
    userId: 'user-123',
    title: 'Hello!',
    body: 'Message body',
    sourceSystem: 'web-app',
    priority: 'normal',  // low, normal, high, critical
    channels: ['in_app', 'email'],
    metadata: { key: 'value' }
});
```

#### `getNotifications(options)`
```javascript
const result = await hermes.getNotifications({
    userId: 'user-123',  // Optional if set in constructor
    isRead: false,       // null, true, or false
    limit: 20,
    offset: 0
});
```

#### `getUnreadCount(userId)`
```javascript
const count = await hermes.getUnreadCount('user-123');
```

#### `markAsRead(notificationId)`
```javascript
await hermes.markAsRead('notification-id');
```

#### `markAllAsRead(userId)`
```javascript
await hermes.markAllAsRead('user-123');
```

#### `connectSSE(userId)`
```javascript
hermes.connectSSE('user-123');
```

#### `disconnectSSE()`
```javascript
hermes.disconnectSSE();
```

### Events

```javascript
// New notification received
hermes.on('notification', (notification) => {
    console.log('New notification:', notification);
});

// SSE connected
hermes.on('connected', (data) => {
    console.log('Connected:', data);
});

// SSE disconnected
hermes.on('disconnected', (data) => {
    console.log('Disconnected:', data);
});

// Error occurred
hermes.on('error', (error) => {
    console.error('Error:', error);
});

// Unread count updated
hermes.on('unreadCount', (count) => {
    console.log('Unread count:', count);
});
```

### Status

```javascript
const status = hermes.getStatus();
// {
//   isConnected: true,
//   reconnectAttempts: 0,
//   hasEventSource: true
// }
```

---

## 🎯 Use Cases

### Django Templates
Copy `hermes-client.js` to your `static/js/` folder and include it in your templates.

### React/Next.js
Copy to `public/hermes-client.js` and import in your components.

### Vue/Nuxt
Copy to `public/hermes-client.js` and import in your components.

### Angular
Copy to `src/assets/hermes-client.js` and import in your components.

### Vanilla JS
Just include the script tag and use `window.HermesClient`.

---

## 🔧 Django Integration Example

```python
# views.py
from django.shortcuts import render

def home(request):
    context = {
        'hermes_base_url': 'http://localhost:8000',
        'profile_token': request.user.profile_token,
        'user_id': request.user.id
    }
    return render(request, 'home.html', context)
```

```html
<!-- home.html -->
{% load static %}
<!DOCTYPE html>
<html>
<head>
    <script src="{% static 'js/hermes-client.js' %}"></script>
</head>
<body>
    <div id="notifications"></div>
    
    <script>
        const hermes = new HermesClient({
            baseUrl: '{{ hermes_base_url }}',
            profileToken: '{{ profile_token }}',
            userId: '{{ user_id }}',
            debug: true
        });
        
        hermes.on('notification', (notification) => {
            const div = document.getElementById('notifications');
            div.innerHTML += `<div>${notification.title}: ${notification.body}</div>`;
        });
        
        hermes.connectSSE();
    </script>
</body>
</html>
```

---

## ✅ Advantages

- ✅ **No build step** - Just copy and use
- ✅ **No dependencies** - Pure JavaScript
- ✅ **Framework agnostic** - Works everywhere
- ✅ **Small size** - ~10KB unminified
- ✅ **Easy to customize** - Edit the source directly
- ✅ **No npm/pip** - No package manager needed

---

## 📝 License

MIT

