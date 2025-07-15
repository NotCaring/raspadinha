import { defineStore } from 'pinia'
import { db } from '@/lib/database.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    userBalance: (state) => state.user?.balance || 0,
    userStats: (state) => ({
      gamesPlayed: state.user?.games_played || 0,
      gamesWon: state.user?.games_won || 0,
      totalDeposited: state.user?.total_deposited || 0,
      totalWithdrawn: state.user?.total_withdrawn || 0
    })
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const result = await db.loginUser(email, password)
        
        if (result.success) {
          this.user = result.user
          this.token = result.token
          this.isAuthenticated = true
          
          // Salvar no localStorage
          localStorage.setItem('user_token', result.token)
          localStorage.setItem('user_data', JSON.stringify(result.user))
          
          return { success: true }
        } else {
          return { success: false, error: result.error }
        }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      try {
        const result = await db.registerUser(userData)
        
        if (result.success) {
          // Após registro, fazer login automático
          return await this.login(userData.email, userData.password)
        } else {
          return { success: false, error: result.error }
        }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_data')
    },

    async checkSession() {
      const token = localStorage.getItem('user_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        try {
          const result = await db.verifyUserSession(token)
          
          if (result.success) {
            this.user = result.user
            this.token = token
            this.isAuthenticated = true
            return true
          } else {
            this.logout()
            return false
          }
        } catch (error) {
          this.logout()
          return false
        }
      }
      
      return false
    },

    async refreshUserData() {
      if (!this.user?.id) return
      
      try {
        const result = await db.getUser(this.user.id)
        if (result.success) {
          this.user = result.data
          localStorage.setItem('user_data', JSON.stringify(result.data))
        }
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error)
      }
    },

    async getUserStats() {
      if (!this.user?.id) return null
      
      try {
        const result = await db.getUserStats(this.user.id)
        return result.success ? result.stats : null
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        return null
      }
    }
  }
})