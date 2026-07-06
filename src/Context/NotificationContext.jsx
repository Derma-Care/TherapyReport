import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { setupForegroundListener, readPendingNotificationsFromIDB, subscribeToBroadcastChannel } from '../firebase'

// ── Context ─────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null)

// ── Storage key ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'therapist_notifications'

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveToStorage = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch { }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {

  const [notifications, setNotifications] = useState(() => loadFromStorage())
  const unsubscribeRef = useRef(null)
  useEffect(() => {
    console.log("Notifications Updated", notifications);
  }, [notifications]);
  // Persist whenever list changes
  useEffect(() => {
    saveToStorage(notifications)
  }, [notifications])

  // ── Add notification (from FCM foreground) ───────────────────────────────
  const addNotification = useCallback((payload) => {
    const { title, body, data, type: normalizedType } = buildNotifObject(payload)
    const newNotif = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      body,
      type: normalizedType,
      data,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)) // max 50 stored
  }, [])

  // ── Mark all as read ─────────────────────────────────────────────────────
  // const markAllRead = useCallback(() => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  // }, [])
  const markAllRead = useCallback(() => {
    console.log("Read All Clicked");
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    console.log("Clear All Clicked");
    setNotifications([]);
  }, []);

  const clearOne = useCallback((id) => {
    console.log("Clear One", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markOneRead = useCallback((id) => {
    console.log("Mark One Read", id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // ── Subscribe to foreground FCM messages ─────────────────────────────────
  useEffect(() => {
    const unsub = setupForegroundListener((payload) => {
      addNotification(payload)

      // Also show a browser notification if tab is not focused
      if (document.visibilityState !== 'visible') {
        const { title, body } = buildNotifObject(payload)
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/192x192.png' })
        }
      }
    })

    unsubscribeRef.current = unsub
    return () => {
      if (typeof unsubscribeRef.current === 'function') {
        unsubscribeRef.current()
      }
    }
  }, [addNotification])

  // ── Listen to SW messages (background→foreground bridge) ─────────────────
  useEffect(() => {
    // 1. Load any pending messages stored in IDB while app was closed
    const loadPending = async () => {
      const pending = await readPendingNotificationsFromIDB()
      if (pending && pending.length > 0) {
        setNotifications((prev) => {
          const newNotifs = [...pending, ...prev]
          // Filter out exact duplicates based on ID
          const unique = newNotifs.reduce((acc, current) => {
            const x = acc.find((item) => item.id === current.id)
            if (!x) return acc.concat([current])
            return acc
          }, [])
          return unique.slice(0, 50)
        })
      }
    }
    loadPending()

    // 2. Subscribe to BroadcastChannel for real-time background messages (e.g. app in background tab)
    const unsubBroadcast = subscribeToBroadcastChannel((payload) => {
      addNotification(payload)
    })

    return () => {
      unsubBroadcast()
    }
  }, [addNotification])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllRead,
        clearAll,
        clearOne,
        markOneRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

// ── Helper ───────────────────────────────────────────────────────────────────
function buildNotifObject(payload) {
  const notif = payload?.notification || {}
  const data = payload?.data || {}
  // Normalize type to lowercase so TYPE_META lookups work regardless of backend casing (BOOKING, Booking, booking)
  const rawType = data.type || notif.type || 'general'
  const type = rawType.toLowerCase()
  return {
    title: notif.title || data.title || 'PhysioCare',
    body: notif.body || data.body || 'You have a new notification',
    type,
    data: { ...data, type, navigatePath: data.navigatePath || data.navigate_path || '' },
  }
}
