import { Suspense } from 'react'
import NotificationsPage from './NotificationsPage'
import NotificationsLoading from './loading'

export const metadata = {
  title: 'Notifications | CampusX',
  description: 'View and manage your notifications on CampusX',
}

export default function Page() {
  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsPage />
    </Suspense>
  )
}
