@@ .. @@
 import { createApp } from 'vue'
 import { createPinia } from 'pinia'
 import App from './App.vue'
 import router from './router'
+import { useAuthStore } from './stores/auth.js'
+import { useGameStore } from './stores/game.js'

 import './style.css'

 const app = createApp(App)
 const pinia = createPinia()

 app.use(pinia)
 app.use(router)

+// Inicializar stores
+const authStore = useAuthStore()
+const gameStore = useGameStore()
+
+// Verificar sessão ao iniciar
+authStore.checkSession().then(() => {
+  if (authStore.isAuthenticated) {
+    gameStore.loadScratchCards()
+    gameStore.loadUserPurchases()
+    gameStore.loadUserGames()
+    gameStore.loadUserPrizes()
+  }
+})
+
 app.mount('#app')