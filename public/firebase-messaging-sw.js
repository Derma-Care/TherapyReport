// ============================================================
// firebase-messaging-sw.js  –  Background FCM Service Worker
// ============================================================
// ✅ Firebase compat CDN version must be close to the app's Firebase SDK
//    App uses firebase@12.x → use 11.9.0 compat (latest stable compat build)
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js')

// ── Activate this SW immediately (no waiting for old SW to die) ──────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// ── Firebase config (must EXACTLY match src/firebase.js) ─────────────────────
firebase.initializeApp({
  apiKey: 'AIzaSyApKucCeDspoqLR-hLZOFm7ZKMJBza281c',
  authDomain: 'ccms-45d7d.firebaseapp.com',
  projectId: 'ccms-45d7d',
  storageBucket: 'ccms-45d7d.appspot.com',
  messagingSenderId: '386304374153',
  appId: '1:386304374153:web:a38254c2401db7bafd9d58',
})

const messaging = firebase.messaging()

// ── IndexedDB Setup ────────────────────────────────────────────────────────────
const IDB_NAME = 'physio_sw_store'
const IDB_STORE = 'pending_notifications'

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 2)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

async function saveNotificationToIDB(notif) {
  try {
    const db = await openIDB()
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(notif)
    await new Promise((res, rej) => {
      tx.oncomplete = res
      tx.onerror = rej
    })
    db.close()
  } catch (err) {
    console.error('[SW] Failed to save to IDB:', err)
  }
}

// ── Background message handler ─────────────────────────────────────────────────
// ✅ onBackgroundMessage is ONLY called when the app tab is NOT focused.
// ✅ When app is focused, the onMessage() in firebase.js handles it instead.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const notif = payload.notification || {}
  const notifData = payload.data || {}

  const notificationTitle = notif.title || notifData.title || 'PhysioCare'
  const notificationBody = notif.body || notifData.body || 'You have a new notification'
  const notificationIcon = notif.icon || '/192x192.png'

  // Determine click URL based on notification's navigatePath sent by backend
  // Backend sends: navigatePath = "therapist" or "therapist-feedback"
  const navigatePath = notifData.navigatePath || notifData.navigate_path || ''
  const type = notifData.type || ''
  let clickUrl = '/'
  if (navigatePath) {
    // Ensure it starts with a slash
    clickUrl = navigatePath.startsWith('/') ? navigatePath : `/${navigatePath}`
  } else if (type === 'feedback') {
    clickUrl = '/therapist-feedback'
  } else if (type === 'appointment') {
    clickUrl = '/therapist'
  } else {
    clickUrl = '/therapist'
  }

  const options = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/192x192.png',
    image: notif.image || undefined,
    tag: notifData.notificationId || type || 'physiocare-notification',
    renotify: true,
    requireInteraction: false,
    data: {
      url: clickUrl,
      type,
      notificationId: notifData.notificationId || '',
      ...notifData,
    },
    actions: [
      { action: 'open', title: '📋 Open' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
  }

  // Save to IDB for when the app opens later
  const idbNotif = {
    id: notifData.notificationId || `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: notificationTitle,
    body: notificationBody,
    type,
    data: notifData,
    timestamp: new Date().toISOString(),
    read: false,
  }

  // ✅ MUST return the promise from showNotification so the SW stays alive
  return Promise.all([
    saveNotificationToIDB(idbNotif),
    self.registration.showNotification(notificationTitle, options),
    // Broadcast to any open tabs (e.g. app open in background tab)
    new Promise((resolve) => {
      if ('BroadcastChannel' in self) {
        const channel = new BroadcastChannel('fcm_background_channel')
        channel.postMessage({ type: 'BACKGROUND_NOTIFICATION', notif: payload })
        channel.close()
      }
      resolve()
    }),
  ])
})

// ── Notification click handler ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const { url } = event.notification.data || {}
  const targetUrl = url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url)
        const targetPath = new URL(targetUrl, self.location.origin).pathname
        if (clientUrl.pathname === targetPath && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
