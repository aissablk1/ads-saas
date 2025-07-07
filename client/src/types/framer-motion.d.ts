import { HTMLAttributes } from 'react'

declare module 'framer-motion' {
  interface MotionProps extends HTMLAttributes<HTMLElement> {
    className?: string
    id?: string
    style?: React.CSSProperties
  }
} 