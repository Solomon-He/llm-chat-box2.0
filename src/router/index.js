import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/chat',
      component: () => import('@/views/ChatView.vue'),
    },
  ],
})

export default router
