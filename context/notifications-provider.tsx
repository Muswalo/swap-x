import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { registerForPushNotificationsAsync } from "../utils/register-for-push-notifications-async";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // use the actual type from expo-notifications
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const refreshUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      
      const newCount = count || 0;
      setUnreadCount(newCount);
      
      // Update badge count
      await Notifications.setBadgeCountAsync(newCount);
    } catch (err) {
      console.error('Error refreshing unread count:', err);
    }
  };

  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);

        // Get current user and store token in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user && token) {
            console.log ("Storing push token for user:", user.id, "Token:", token);
          await supabase.from("notification_tokens").upsert({
            user_id: user.id,
            expo_push_token: token,
            device_id: Device.osInternalBuildId ?? "unknown",
            platform: Platform.OS,
          });
          
          // Load initial unread count
          await refreshUnreadCount();
        }
      } catch (err) {
        setError(err as Error);
      }
    };

    setupPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔔 Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        
        // Handle notification tap - navigate to relevant screen
        const data = response.notification.request.content.data;
        // Navigation logic can be added here based on notification type
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Real-time subscription for notification updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refresh unread count when notifications change
            refreshUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error, unreadCount, refreshUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
