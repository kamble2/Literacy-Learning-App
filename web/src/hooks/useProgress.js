import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, limit, getDocs,
  addDoc, doc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useProgress(uid) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    const q = query(
      collection(db, 'progress', uid, 'sessions'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    getDocs(q)
      .then(snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [uid])

  return { sessions, loading }
}

export async function recordSession(uid, module, letterOrWord, score = 100) {
  if (!uid) return
  try {
    await addDoc(collection(db, 'progress', uid, 'sessions'), {
      module, letterOrWord, score, timestamp: serverTimestamp(),
    })
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    const data = snap.data() || {}
    const today = new Date().toDateString()
    const lastActive = data.lastActive?.toDate?.()?.toDateString?.() ?? null
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    await updateDoc(userRef, {
      xp: (data.xp || 0) + 10,
      ...(lastActive !== today
        ? {
            streak: lastActive === yesterday ? (data.streak || 0) + 1 : 1,
            lastActive: new Date(),
          }
        : {}),
    })
  } catch (e) {
    console.error('recordSession failed', e)
  }
}
