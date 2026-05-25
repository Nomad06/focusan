import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type ToastKind = 'info' | 'success' | 'error'
export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export const useToast = () => useContext(Ctx).toast

let nextId = 1

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextId++
    setItems(prev => [...prev, { id, kind, message }])
    setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map(it => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
              className={`toast ${it.kind}`}
            >
              <span className="flex-1">{it.message}</span>
              <button
                onClick={() => setItems(prev => prev.filter(t => t.id !== it.id))}
                className="text-sumi-gray hover:text-sumi-black text-xs leading-none ml-2"
                aria-label="Dismiss"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
