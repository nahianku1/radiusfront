import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/managers/_layout"!</div>
}
