import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/managers/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/managers/_layout"!</div>
}
