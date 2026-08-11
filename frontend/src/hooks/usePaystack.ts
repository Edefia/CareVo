import { useCallback, useEffect, useRef } from 'react'

/**
 * Paystack Inline Popup SDK Hook.
 * Dynamically loads the Paystack inline JS and provides a function to open the payment popup.
 * 
 * Usage:
 * ```tsx
 * const { openPaystack, isReady } = usePaystack()
 * 
 * openPaystack({
 *   publicKey: 'pk_test_...',
 *   email: 'user@example.com',
 *   amount: 15000, // in pesewas
 *   reference: 'CRV-xxx-123',
 *   onSuccess: (response) => { ... },
 *   onClose: () => { ... },
 * })
 * ```
 */

declare global {
  interface Window {
    PaystackPop: any
  }
}

interface PaystackConfig {
  publicKey: string
  email: string
  amount: number // in pesewas (smallest currency unit)
  reference: string
  currency?: string
  metadata?: Record<string, unknown>
  onSuccess: (response: { reference: string; transaction: string; status: string }) => void
  onClose: () => void
}

export function usePaystack() {
  const isLoaded = useRef(false)
  const isLoading = useRef(false)

  // Load the Paystack inline SDK
  useEffect(() => {
    if (isLoaded.current || isLoading.current) return

    // Check if already loaded
    if (window.PaystackPop) {
      isLoaded.current = true
      return
    }

    // Check if script tag already exists
    const existing = document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]')
    if (existing) {
      existing.addEventListener('load', () => { isLoaded.current = true })
      return
    }

    isLoading.current = true
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => {
      isLoaded.current = true
      isLoading.current = false
    }
    script.onerror = () => {
      isLoading.current = false
      console.error('Failed to load Paystack SDK')
    }
    document.head.appendChild(script)
  }, [])

  const openPaystack = useCallback((config: PaystackConfig) => {
    if (!window.PaystackPop) {
      console.error('Paystack SDK not loaded yet')
      config.onClose()
      return
    }

    try {
      const popup = new window.PaystackPop()
      popup.newTransaction({
        key: config.publicKey,
        email: config.email,
        amount: config.amount,
        currency: config.currency || 'GHS',
        ref: config.reference,
        metadata: config.metadata || {},
        onSuccess: (response: any) => {
          config.onSuccess({
            reference: response.reference || config.reference,
            transaction: response.transaction || response.trxref || '',
            status: response.status || 'success',
          })
        },
        onCancel: () => {
          config.onClose()
        },
        onClose: () => {
          config.onClose()
        },
      })
    } catch (error) {
      console.error('Failed to open Paystack popup:', error)
      config.onClose()
    }
  }, [])

  return {
    openPaystack,
    isReady: isLoaded.current || !!window.PaystackPop,
  }
}
