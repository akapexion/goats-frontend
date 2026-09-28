import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, CheckCheck, ShoppingBag, Clock, ArrowRight, Check } from "lucide-react"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"

function formatNotificationTime(isoString) {
  if (!isoString) return ""
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffSeconds = Math.floor((now - date) / 1000)

    if (diffSeconds < 60) return "Just now"
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/notifications")
      const list = data.data?.data || data.data || []
      setNotifications(list)
      setUnreadCount(typeof data.unread === "number" ? data.unread : list.filter((n) => !n.read_at).length)
    } catch {
      // Gracefully catch background fetch errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll notifications every 45 seconds for admin
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const handleMarkAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation()
    try {
      await api.post(`/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all")
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark all as read")
    }
  }

  const handleNotificationClick = async (n) => {
    if (!n.read_at) {
      await handleMarkAsRead(n.id)
    }
    setOpen(false)
    navigate("/admin/reports")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        title="Admin Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-popover shadow-2xl py-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center px-4 space-y-2">
                <Bell className="size-8 mx-auto text-muted-foreground/30" />
                <p className="text-xs font-medium text-muted-foreground">
                  No notifications yet. You will be alerted when new orders are placed.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const data = n.data || {}
                const isUnread = !n.read_at
                const timeString = formatNotificationTime(data.placed_at || n.created_at)

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 transition-colors cursor-pointer text-left flex items-start gap-3 ${
                      isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent/50 opacity-80"
                    }`}
                  >
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnread
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <ShoppingBag className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-foreground truncate">
                          Order #{data.order_id || "—"} Placed
                        </span>
                        {timeString && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {timeString}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-foreground/90 font-medium">
                        {data.customer_name || "Customer"}
                        {data.total_amount !== undefined && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                            · ${Number(data.total_amount).toFixed(2)}
                          </span>
                        )}
                      </p>

                      {data.customer_email && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {data.customer_email}
                        </p>
                      )}

                      {data.pickup_date && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
                          <Clock className="size-3" />
                          <span>Pickup: {data.pickup_date} {data.pickup_time ? `(${data.pickup_time})` : ""}</span>
                        </div>
                      )}
                    </div>

                    {isUnread && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="size-6 rounded-full hover:bg-background text-muted-foreground hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0"
                        title="Mark as read"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/20 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate("/admin/reports")
              }}
              className="w-full py-1.5 text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1"
            >
              View Order Reports & Analytics
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
