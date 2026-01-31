import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/nas/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/nas/_layout"!</div>
}
