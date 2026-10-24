import { useState, useEffect, createContext, useContext } from 'react'
import { auth, db } from '../config/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let userDataUnsubscribe
    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      userDataUnsubscribe?.()
      if (!firebaseUser) {
        setUser(null)
        setUserData(null)
        setLoading(false)
        return
      }
      setUser(firebaseUser)
      setLoading(true)
      const userRef = doc(db, 'users', firebaseUser.uid)
      userDataUnsubscribe = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          setUserData({ id: firebaseUser.uid, email: firebaseUser.email, ...snapshot.data() })
        } else {
          const autoData = { name: 'Admin', email: firebaseUser.email, role: 'admin', createdAt: new Date().toISOString() }
          setUserData({ id: firebaseUser.uid, email: firebaseUser.email, ...autoData })
          await setDoc(userRef, autoData)
        }
        setLoading(false)
      }, (error) => {
        console.error('Failed to load user permissions:', error)
        setLoading(false)
      })
    })
    return () => {
      authUnsubscribe()
      userDataUnsubscribe?.()
    }
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
