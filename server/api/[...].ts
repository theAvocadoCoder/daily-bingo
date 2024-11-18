import { clerkClient, getAuth } from 'vue-clerk/server'

export default eventHandler((event) => {
  const { userId } = getAuth(event)

  if (!userId) {
    setResponseStatus(event, 401)
    return
  }

  return clerkClient(event).users.getUser(userId)
})