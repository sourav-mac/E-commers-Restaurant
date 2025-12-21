import '../styles/globals.css'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CartProvider } from '../context/CartContext'
import { NotificationProvider } from '../context/NotificationContext'
import { LoadingProvider, useLoading } from '../context/LoadingContext'
import GlobalNotificationToast from '../components/GlobalNotificationToast'
import GlobalLoader from '../components/GlobalLoader'
import { setupFetchInterceptor, setLoadingCallbacks } from '../lib/fetchInterceptor'

// Inner component that uses LoadingContext
function AppContent({ Component, pageProps }) {
  const router = useRouter()
  const { showLoading, hideLoading, resetLoading } = useLoading()
  const [isClient, setIsClient] = useState(false)

  // Mark as client-side rendered
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Setup fetch interceptor with loading callbacks
  useEffect(() => {
    if (isClient) {
      setLoadingCallbacks(showLoading, hideLoading)
    }
  }, [isClient, showLoading, hideLoading])

  // Setup route change loading
  useEffect(() => {
    if (!router.isReady) return

    const handleRouteChangeStart = () => {
      console.log('📄 Route change started');
      showLoading();
    }
    
    const handleRouteChangeComplete = () => {
      console.log('📄 Route change completed');
      hideLoading();
    }
    
    const handleRouteChangeError = () => {
      console.log('📄 Route change error');
      hideLoading();
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeError', handleRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [router.isReady, router.events, showLoading, hideLoading])

  if (!isClient) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <CartProvider>
          <NotificationProvider>
            <GlobalNotificationToast />
            <Component {...pageProps} />
          </NotificationProvider>
        </CartProvider>
      </>
    )
  }


  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GlobalLoader />
      <CartProvider>
        <NotificationProvider>
          <GlobalNotificationToast />
          <Component {...pageProps} />
        </NotificationProvider>
      </CartProvider>
    </>
  )
}

// Outer component that provides LoadingContext
export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Setup fetch interceptor on client-side only
    if (typeof window !== 'undefined') {
      setupFetchInterceptor()
    }
  }, [])

  return (
    <LoadingProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </LoadingProvider>
  )
}
