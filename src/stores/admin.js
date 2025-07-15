import { defineStore } from 'pinia'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admin: null,
    isAuthenticated: false,
    loading: false,
    stats: {
      totalUsers: 0,
      totalSales: 0,
      totalRevenue: 0,
      activeCards: 0
    }
  }),

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        // Verificar credenciais admin no banco
        const { data: admin, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single()

        if (error || !admin) {
          throw new Error('Credenciais inválidas')
        }

        // Aqui você verificaria a senha com bcrypt
        // Por simplicidade, vou usar comparação direta
        if (password !== 'admin123456') {
          throw new Error('Senha incorreta')
        }

        // Atualizar último login
        await supabase
          .from('admins')
          .update({ last_login: new Date().toISOString() })
          .eq('id', admin.id)

        this.admin = admin
        this.isAuthenticated = true
        
        // Salvar no localStorage
        localStorage.setItem('admin_session', JSON.stringify(admin))
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.admin = null
      this.isAuthenticated = false
      localStorage.removeItem('admin_session')
    },

    async checkSession() {
      const session = localStorage.getItem('admin_session')
      if (session) {
        try {
          const admin = JSON.parse(session)
          this.admin = admin
          this.isAuthenticated = true
          return true
        } catch {
          localStorage.removeItem('admin_session')
        }
      }
      return false
    },

    async loadStats() {
      try {
        // Total de usuários
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Total de vendas
        const { count: totalSales } = await supabase
          .from('user_purchases')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'paid')

        // Receita total
        const { data: revenue } = await supabase
          .from('user_purchases')
          .select('total_amount')
          .eq('payment_status', 'paid')

        const totalRevenue = revenue?.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount), 0) || 0

        // Cards ativos
        const { count: activeCards } = await supabase
          .from('scratch_cards')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        this.stats = {
          totalUsers: totalUsers || 0,
          totalSales: totalSales || 0,
          totalRevenue,
          activeCards: activeCards || 0
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      }
    },

    // CRUD Usuários
    async getUsers(page = 1, limit = 20) {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      return { data, error, count }
    },

    async updateUser(userId, updates) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    },

    async deleteUser(userId) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      return { error }
    },

    // CRUD Raspadinhas
    async getScratchCards() {
      const { data, error } = await supabase
        .from('scratch_cards')
        .select(`
          *,
          prizes (*)
        `)
        .order('created_at', { ascending: false })

      return { data, error }
    },

    async createScratchCard(cardData) {
      const { data, error } = await supabase
        .from('scratch_cards')
        .insert(cardData)
        .select()
        .single()

      return { data, error }
    },

    async updateScratchCard(cardId, updates) {
      const { data, error } = await supabase
        .from('scratch_cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single()

      return { data, error }
    },

    async deleteScratchCard(cardId) {
      const { error } = await supabase
        .from('scratch_cards')
        .delete()
        .eq('id', cardId)

      return { error }
    },

    // CRUD Prêmios
    async createPrize(prizeData) {
      const { data, error } = await supabase
        .from('prizes')
        .insert(prizeData)
        .select()
        .single()

      return { data, error }
    },

    async updatePrize(prizeId, updates) {
      const { data, error } = await supabase
        .from('prizes')
        .update(updates)
        .eq('id', prizeId)
        .select()
        .single()

      return { data, error }
    },

    async deletePrize(prizeId) {
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('id', prizeId)

      return { error }
    },

    // Transações
    async getTransactions(page = 1, limit = 20) {
      const { data, error, count } = await supabase
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
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key')

      return { data, error }
    },

    async updateSetting(key, value) {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value: JSON.stringify(value),
          updated_by: this.admin?.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      return { data, error }
    }
  }
})