import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'

const routes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { requiresGuest: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const adminStore = useAdminStore()
  
  // Check if admin is authenticated
  if (!adminStore.isAuthenticated) {
    await adminStore.checkSession()
  }

  if (to.meta.requiresAuth && !adminStore.isAuthenticated) {
    next('/admin/login')
  } else if (to.meta.requiresGuest && adminStore.isAuthenticated) {
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router