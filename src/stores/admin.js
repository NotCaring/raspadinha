import { defineStore } from 'pinia'
import { db } from '@/lib/database.js'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admin: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    stats: {
      totalUsers: 0,
      totalSales: 0,
      totalRevenue: 0,
      activeCards: 0,
      gamesToday: 0
    }
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const result = await db.loginAdmin(email, password)
        
        if (result.success) {
          this.admin = result.admin
          this.token = result.token
          this.isAuthenticated = true
          
          // Salvar no localStorage
          localStorage.setItem('admin_token', result.token)
          localStorage.setItem('admin_data', JSON.stringify(result.admin))
          
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

    async logout() {
      this.admin = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_data')
    },

    async checkSession() {
      const token = localStorage.getItem('admin_token')
      const adminData = localStorage.getItem('admin_data')
      
      if (token && adminData) {
        try {
          const result = await db.verifyAdminSession(token)
          
          if (result.success) {
            this.admin = result.admin
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

    async loadStats() {
      try {
        const result = await db.getAdminStats()
        if (result.success) {
          this.stats = result.stats
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      }
    },

    // CRUD Usuários
    async getUsers(page = 1, limit = 20) {
      return await db.getAllUsers(page, limit)
    },

    async updateUser(userId, updates) {
      return await db.updateUser(userId, updates)
    },

    async deleteUser(userId) {
      const { error } = await db.supabase
        .from('users')
        .delete()
        .eq('id', userId)

      return { error }
    },

    // CRUD Raspadinhas
    async getScratchCards() {
      return await db.getScratchCards(false) // false = incluir inativas também
    },

    async createScratchCard(cardData) {
      const { data, error } = await db.supabase
        .from('scratch_cards')
        .insert(cardData)
        .select()
        .single()

      return { data, error }
    },

    async updateScratchCard(cardId, updates) {
      const { data, error } = await db.supabase
        .from('scratch_cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single()

      return { data, error }
    },

    async deleteScratchCard(cardId) {
      const { error } = await db.supabase
        .from('scratch_cards')
        .delete()
        .eq('id', cardId)

      return { error }
    },

    // CRUD Prêmios
    async createPrize(prizeData) {
      const { data, error } = await db.supabase
        .from('prizes')
        .insert(prizeData)
        .select()
        .single()

      return { data, error }
    },

    async updatePrize(prizeId, updates) {
      const { data, error } = await db.supabase
        .from('prizes')
        .update(updates)
        .eq('id', prizeId)
        .select()
        .single()

      return { data, error }
    },

    async deletePrize(prizeId) {
      const { error } = await db.supabase
        .from('prizes')
        .delete()
        .eq('id', prizeId)

      return { error }
    },

    // Transações
    async getTransactions(page = 1, limit = 20) {
      const { data, error, count } = await db.supabase
        .from('pix_transactions')
        .select(`
          *,
          users (username, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      return { data, error, count }
    },

    // Configurações do sistema
    async getSettings() {
      return await db.getSettings()
    },

    async updateSetting(key, value) {
      return await db.updateSetting(key, value)
    }
  }
})