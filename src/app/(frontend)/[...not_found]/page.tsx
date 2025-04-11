import { notFound } from 'next/navigation'

export default function CatchAllRoute() {
  // This will trigger the not-found function for this route group
  notFound()
} 