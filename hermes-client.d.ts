/**
 * Hermes Client - TypeScript Definitions
 * Standalone JavaScript client for Hermes notifications
 */

export interface HermesClientConfig {
  /** Base URL of the Hermes server */
  baseUrl?: string;
  /** Application token for sending notifications */
  appToken?: string | null;
  /** Profile token for receiving notifications via SSE */
  profileToken?: string | null;
  /** User ID */
  userId?: string | null;
  /** Enable debug logging */
  debug?: boolean;
}

export interface Notification {
  /** Unique notification ID */
  id: string;
  /** User ID who receives the notification */
  user_id: string;
  /** Notification title */
  title: string;
  /** Notification body/message */
  body: string;
  /** Priority level */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Delivery channels */
  channels?: Array<'in_app' | 'email' | 'sms' | 'push'>;
  /** Whether the notification has been read */
  is_read: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface SendNotificationParams {
  /** User ID to send notification to */
  userId: string;
  /** Notification title */
  title: string;
  /** Notification body/message */
  body: string;
  /** Priority level */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Delivery channels */
  channels?: Array<'in_app' | 'email' | 'sms' | 'push'>;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface GetNotificationsParams {
  /** User ID */
  userId?: string;
  /** Maximum number of notifications to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter by read status */
  is_read?: boolean;
}

export interface GetNotificationsResult {
  /** Array of notifications */
  results: Notification[];
  /** Total count of notifications */
  count: number;
  /** Next page URL */
  next: string | null;
  /** Previous page URL */
  previous: string | null;
}

export type EventType = 
  | 'notification'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'unreadCount';

export type EventCallback<T = any> = (data: T) => void;

/**
 * Hermes Client - Real-time notification client
 * 
 * @example
 * ```typescript
 * const hermes = new HermesClient({
 *   baseUrl: 'http://localhost:8000',
 *   profileToken: 'your-token',
 *   userId: 'user-123'
 * });
 * 
 * hermes.on('notification', (notification) => {
 *   console.log('New notification:', notification);
 * });
 * 
 * hermes.connectSSE();
 * ```
 */
export class HermesClient {
  /** Base URL of the Hermes server */
  baseUrl: string;
  /** Application token for sending notifications */
  appToken: string | null;
  /** Profile token for receiving notifications via SSE */
  profileToken: string | null;
  /** User ID */
  userId: string | null;
  /** Enable debug logging */
  debug: boolean;

  /**
   * Create a new Hermes client instance
   * @param config - Client configuration
   */
  constructor(config?: HermesClientConfig);

  /**
   * Register an event listener
   * @param event - Event type to listen for
   * @param callback - Callback function to execute when event occurs
   * 
   * @example
   * ```typescript
   * hermes.on('notification', (notification) => {
   *   console.log('Received:', notification);
   * });
   * ```
   */
  on(event: 'notification', callback: EventCallback<Notification>): void;
  on(event: 'connected', callback: EventCallback<void>): void;
  on(event: 'disconnected', callback: EventCallback<void>): void;
  on(event: 'error', callback: EventCallback<Error>): void;
  on(event: 'unreadCount', callback: EventCallback<number>): void;
  on(event: EventType, callback: EventCallback): void;

  /**
   * Remove an event listener
   * @param event - Event type
   * @param callback - Callback function to remove
   */
  off(event: EventType, callback: EventCallback): void;

  /**
   * Emit an event (internal use)
   * @param event - Event type
   * @param data - Event data
   */
  emit(event: EventType, data?: any): void;

  /**
   * Send a notification
   * @param params - Notification parameters
   * @returns Promise that resolves when notification is sent
   * 
   * @example
   * ```typescript
   * await hermes.sendNotification({
   *   userId: 'user-456',
   *   title: 'Hello!',
   *   body: 'This is a test',
   *   priority: 'normal',
   *   channels: ['in_app', 'email']
   * });
   * ```
   */
  sendNotification(params: SendNotificationParams): Promise<any>;

  /**
   * Get notifications for a user
   * @param params - Query parameters
   * @returns Promise that resolves with notifications
   * 
   * @example
   * ```typescript
   * const result = await hermes.getNotifications({
   *   userId: 'user-123',
   *   limit: 50,
   *   is_read: false
   * });
   * console.log('Unread notifications:', result.results);
   * ```
   */
  getNotifications(params?: GetNotificationsParams): Promise<GetNotificationsResult>;

  /**
   * Get unread notification count
   * @param userId - User ID (optional, uses client userId if not provided)
   * @returns Promise that resolves with unread count
   * 
   * @example
   * ```typescript
   * const count = await hermes.getUnreadCount();
   * console.log('Unread:', count);
   * ```
   */
  getUnreadCount(userId?: string): Promise<number>;

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID to mark as read
   * @returns Promise that resolves when marked
   * 
   * @example
   * ```typescript
   * await hermes.markAsRead('notification-id-123');
   * ```
   */
  markAsRead(notificationId: string): Promise<any>;

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID (optional, uses client userId if not provided)
   * @returns Promise that resolves when all marked
   * 
   * @example
   * ```typescript
   * await hermes.markAllAsRead();
   * ```
   */
  markAllAsRead(userId?: string): Promise<any>;

  /**
   * Connect to SSE (Server-Sent Events) for real-time notifications
   * @param userId - User ID (optional, uses client userId if not provided)
   * 
   * @example
   * ```typescript
   * hermes.connectSSE();
   * // or with specific user
   * hermes.connectSSE('user-123');
   * ```
   */
  connectSSE(userId?: string): void;

  /**
   * Disconnect from SSE
   * 
   * @example
   * ```typescript
   * hermes.disconnectSSE();
   * ```
   */
  disconnectSSE(): void;

  /**
   * Check if SSE is connected
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean;
}

export default HermesClient;

// Global declaration for browser usage
declare global {
  interface Window {
    HermesClient: typeof HermesClient;
  }
}

