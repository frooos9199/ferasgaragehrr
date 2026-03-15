import { useState, useEffect, createContext, useContext } from 'react'
import { auth, db } from '../config/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

const StoreAuthContext = createContext()

export function StoreAuthProvider({ children }) {
  const [buyer, setBuyer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'buyers', firebaseUser.uid))
        if (snap.exists()) {
          setBuyer({ id: firebaseUser.uid, ...snap.data() })
        }
      } else {
        setBuyer(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const register = async (name, email, phone, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const buyerData = { name, email, phone, purchases: [], createdAt: new Date().toISOString() }
    await setDoc(doc(db, 'buyers', cred.user.uid), buyerData)
    setBuyer({ id: cred.user.uid, ...buyerData })
    return { id: cred.user.uid, ...buyerData }
  }

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'buyers', cred.user.uid))
    if (snap.exists()) {
      const data = { id: cred.user.uid, ...snap.data() }
      setBuyer(data)
      return data
    }
    throw new Error('Buyer profile not found')
  }

  const logout = async () => {
    await signOut(auth)
    setBuyer(null)
  }

  const addPurchase = async (productId) => {
    if (!buyer) return
    await updateDoc(doc(db, 'buyers', buyer.id), {
      purchases: arrayUnion({ productId, date: new Date().toISOString(), status: 'pending' })
    })
    setBuyer(prev => ({
      ...prev,
      purchases: [...(prev.purchases || []), { productId, date: new Date().toISOString(), status: 'pending' }]
    }))
  }

  return (
    <StoreAuthContext.Provider value={{ buyer, loading, register, login, logout, addPurchase }}>
      {children}
    </StoreAuthContext.Provider>
  )
}

export const useStoreAuth = () => useContext(StoreAuthContext)
