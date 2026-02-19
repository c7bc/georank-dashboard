import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  MessageSquare,
  Search,
  FileText,
  Lightbulb,
  Users,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Target,
  TrendingUp,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api/notifications";
import { useWebSocket } from "@/contexts/websocket-context";
import type { NotificationItem, NotificationType } from "@/types";

const notificationIcons: Record<NotificationType, React.ElementType> = {
  new_mention: MessageSquare,
  keyword_analyzed: Search,
  report_ready: FileText,
  recommendation: Lightbulb,
  team_invite: Users,
  team_joined: UserPlus,
  plan_changed: CreditCard,
  payment_failed: AlertTriangle,
  competitor_analyzed: Target,
  geo_score_changed: TrendingUp,
  query_failed: XCircle,
  recommendation_failed: XCircle,
  report_failed: XCircle,
};

function formatRelativeTime(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return t("notifications.justNow");
  if (diffMinutes < 60) return t("notifications.minutesAgo", { count: diffMinutes });
  if (diffHours < 24) return t("notifications.hoursAgo", { count: diffHours });
  return t("notifications.daysAgo", { count: diffDays });
}

export function NotificationPanel() {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });
  const { ws } = useWebSocket();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch unread count on mount
  useEffect(() => {
    notificationsApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => {});
  }, []);

  // Fetch full list when popover opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen && !loaded) {
        notificationsApi
          .list({ limit: 20 })
          .then((res) => {
            setNotifications(res.notifications || []);
            setUnreadCount(res.unread_count);
            setLoaded(true);
          })
          .catch(() => {});
      }
    },
    [loaded]
  );

  // WebSocket listener for real-time notifications
  useEffect(() => {
    if (!ws) return;

    const handleNotification = (data: unknown) => {
      const notification = data as NotificationItem;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);

      if (notification.type === 'plan_changed') {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        queryClient.invalidateQueries({ queryKey: ['billing', 'plan'] });
        queryClient.invalidateQueries({ queryKey: ['billing', 'usage'] });
        queryClient.invalidateQueries({ queryKey: ['scheduling'] });
      }

      if (
        notification.type === 'keyword_analyzed' ||
        notification.type === 'recommendation' ||
        notification.type === 'report_ready'
      ) {
        toast.success(notification.title, { description: notification.message });
      } else if (
        notification.type === 'query_failed' ||
        notification.type === 'recommendation_failed' ||
        notification.type === 'report_failed'
      ) {
        toast.error(notification.title, { description: notification.message });
      }
    };

    ws.on("notification", handleNotification);
    return () => ws.off("notification", handleNotification);
  }, [ws]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore errors
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore errors
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3" />
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {t("notifications.empty")}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon =
                  notificationIcons[notification.type] || Bell;
                return (
                  <button
                    key={notification.id}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        !notification.read
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            !notification.read
                              ? "font-semibold"
                              : "font-medium text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatRelativeTime(notification.created_at, t)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
