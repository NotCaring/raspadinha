import { defineStore } from 'pinia'
import { db } from '@/lib/database.js'
import { useAuthStore } from './auth.js'

export const useGameStore = defineStore('game', {
  state: () => ({
    scratchCards: [],
    currentCard: null,
    userPurchases: [],
    userGames: [],
    userPrizes: [],
    loading: false
  }),

  actions: {
    async loadScratchCards() {
      this.loading = true
      try {
        const result = await db.getScratchCards(true)
        if (result.success) {
          this.scratchCards = result.data
        }
      } catch (error) {
        console.error('Erro ao carregar raspadinhas:', error)
      } finally {
        this.loading = false
      }
    },

    async getScratchCard(id) {
      try {
        const result = await db.getScratchCard(id)
        if (result.success) {
          this.currentCard = result.data
          return result.data
        }
      } catch (error) {
        console.error('Erro ao buscar raspadinha:', error)
      }
      return null
    },

    async purchaseCard(cardId, quantity = 1) {
      const authStore = useAuthStore()
      if (!authStore.user?.id) {
        throw new Error('Usuário não autenticado')
      }

      this.loading = true
      try {
        const result = await db.createPurchase(authStore.user.id, cardId, quantity)
        
        if (result.success) {
          await this.loadUserPurchases()
          return result.purchase
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async playGame(purchaseId, cardId) {
      const authStore = useAuthStore()
      if (!authStore.user?.id) {
        throw new Error('Usuário não autenticado')
      }

      this.loading = true
      try {
        const result = await db.playGame(authStore.user.id, purchaseId, cardId)
        
        if (result.success) {
          await this.loadUserGames()
          await this.loadUserPrizes()
          await authStore.refreshUserData()
          return result.result
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadUserPurchases() {
      const authStore = useAuthStore()
      if (!authStore.user?.id) return

      try {
        const { data, error } = await db.supabase
          .from('user_purchases')
          .select(`
            *,
            scratch_cards (title, image_url)
          `)
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })

        if (!error) {
          this.userPurchases = data || []
        }
      } catch (error) {
        console.error('Erro ao carregar compras:', error)
      }
    },

    async loadUserGames() {
      const authStore = useAuthStore()
      if (!authStore.user?.id) return

      try {
        const { data, error } = await db.supabase
          .from('user_games')
          .select(`
            *,
            scratch_cards (title),
            prizes (name, value, prize_type)
          `)
          .eq('user_id', authStore.user.id)
          .order('played_at', { ascending: false })

        if (!error) {
          this.userGames = data || []
        }
      } catch (error) {
        console.error('Erro ao carregar jogos:', error)
      }
    },

    async loadUserPrizes() {
      const authStore = useAuthStore()
      if (!authStore.user?.id) return

      try {
        const { data, error } = await db.supabase
          .from('user_prizes')
          .select(`
            *,
            prizes (name, description, value, prize_type, image_url),
            user_games (
              scratch_cards (title)
            )
          `)
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })

        if (!error) {
          this.userPrizes = data || []
        }
      } catch (error) {
        console.error('Erro ao carregar prêmios:', error)
      }
    },

    async confirmPayment(purchaseId, externalId = null) {
      try {
        const result = await db.confirmPayment(purchaseId, externalId)
        
        if (result.success) {
          await this.loadUserPurchases()
          return true
        }
        
        return false
      } catch (error) {
        console.error('Erro ao confirmar pagamento:', error)
        return false
      }
    },

    getScratchCardsByCategory(category) {
      return this.scratchCards.filter(card => card.category === category)
    },

    getPendingPurchases() {
      return this.userPurchases.filter(purchase => purchase.payment_status === 'pending')
    },

    getPaidPurchases() {
      return this.userPurchases.filter(purchase => purchase.payment_status === 'paid')
    },

    getWinningGames() {
      return this.userGames.filter(game => game.is_winner)
    },

    getPendingPrizes() {
      return this.userPrizes.filter(prize => prize.status === 'pending')
    }
  }
})