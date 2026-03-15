import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'

export function useCollection(collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt
      }))
      setData(items)
      setLoading(false)
    }, (error) => {
      console.error(`Firestore error [${collectionName}]:`, error)
      setLoading(false)
    })
    return unsub
  }, [collectionName])

  const add = async (item) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...item,
      createdAt: serverTimestamp()
    })
    return { ...item, id: docRef.id }
  }

  const update = async (id, updates) => {
    await updateDoc(doc(db, collectionName, id), updates)
  }

  const remove = async (id) => {
    await deleteDoc(doc(db, collectionName, id))
  }

  return { data, loading, add, update, remove }
}
