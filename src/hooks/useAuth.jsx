import { useState, useEffect, createContext, useContext } from 'react'
import { auth, db } from '../config/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          setUserData({ id: firebaseUser.uid, email: firebaseUser.email, ...snap.data() })
        } else {
          const autoData = { name: 'Admin', email: firebaseUser.email, role: 'admin', createdAt: new Date().toISOString() }
          await setDoc(doc(db, 'users', firebaseUser.uid), autoData)
          setUserData({ id: firebaseUser.uid, ...autoData })
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  const logout = () => signOut(auth)

  const isAdmin = userData?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
