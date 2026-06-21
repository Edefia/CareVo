import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useNotifications(1, 10);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.items || [];
  const unreadCount = data?.unreadCount || 0;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]"
      >
        <Bell className="h-[18px] w-[18px]" />
      </button>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="absolute right-[-4px] top-[-4px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] md:w-[380px] rounded-[var(--radius-lg)] bg-white shadow-xl border border-slate-100 animate-in slide-in-from-top-2 fade-in">
          
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-xs font-medium text-[var(--color-forest)] hover:underline flex items-center gap-1"
              >
                {markAllAsRead.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Bell className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif: any) => (
                  <div 
                    key={notif._id}
                    className={cn(
                      "relative flex gap-3 border-b p-4 transition-colors hover:bg-slate-50 group",
                      !notif.isRead ? "bg-blue-50/30" : ""
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 h-full w-[3px] bg-[var(--color-forest)]" />
                    )}
                    <div className="flex-1">
                      <h4 className={cn("text-sm mb-1", !notif.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notif.isRead && (
                        <button 
                          onClick={(e) => handleMarkAsRead(e, notif._id)}
                          className="h-6 w-6 rounded-full bg-white border flex items-center justify-center text-slate-400 hover:text-[var(--color-forest)] hover:border-[var(--color-forest)]"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDelete(e, notif._id)}
                        className="h-6 w-6 rounded-full bg-white border flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t p-2 text-center bg-slate-50 rounded-b-[var(--radius-lg)]">
            <button className="text-xs font-medium text-slate-500 hover:text-slate-800">
              View All History
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
