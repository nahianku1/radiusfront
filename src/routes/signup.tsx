import { createFileRoute } from '@tanstack/react-router'


function RouteComponent() {
  return <div>Hello "/signup"!</div>
}


export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})


