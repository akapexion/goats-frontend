import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'

export function useAOSInit() {
  const location = useLocation()

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      offset: 30,
    })

    AOS.refresh()

    const timer1 = setTimeout(() => AOS.refresh(), 200)
    const timer2 = setTimeout(() => AOS.refresh(), 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [location.pathname])
}

export function AOSInit() {
  useAOSInit()
  return null
}
