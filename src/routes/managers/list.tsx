import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/managers/list')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/managers/list"!</div>
}
