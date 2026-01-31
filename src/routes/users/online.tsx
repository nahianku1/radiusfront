import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/online')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-4">Online Users</div>
}
