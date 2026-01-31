import { createFileRoute } from '@tanstack/react-router'
import { LoginSuccess } from '../pages/LoginSuccess'

export const Route = createFileRoute('/login/success')({
  component: LoginSuccess,
})
