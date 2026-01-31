import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/packages/_layout')({
  component: () => <div>Hello "/packages/_layout"!</div>
})
