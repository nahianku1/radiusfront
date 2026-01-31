import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/managers/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/managers/new"!</div>
}
