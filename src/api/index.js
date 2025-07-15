// API local para substituir a API externa
import { db } from '@/lib/database.js'

class LocalAPI {
  constructor() {
    this.baseURL = '' // Não precisamos mais de URL externa
  }

  // ==================== AUTENTICAÇÃO ====================
  
  async login(credentials) {
    return await db.loginUser(credentials.email, credentials.password)
  }

  async register(userData) {
    return await db.registerUser(userData)
  }

  async logout() {
    // Limpar sessão local
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_data')
    return { success: true }
  }

  // ==================== USUÁRIO ====================

  async getProfile() {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const result = await db.verifyUserSession(token)
    if (!result.success) {
      throw new Error(result.error)
    }

    return { success: true, data: result.user }
  }

  async updateProfile(data) {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    return await db.updateUser(sessionResult.user.id, data)
  }

  // ==================== RASPADINHAS ====================

  async getScratchCards() {
    return await db.getScratchCards(true)
  }

  async getScratchCard(id) {
    return await db.getScratchCard(id)
  }

  async getScratchCardsByCategory(category) {
    const result = await db.getScratchCards(true)
    if (result.success) {
      const filtered = result.data.filter(card => card.category === category)
      return { success: true, data: filtered }
    }
    return result
  }

  // ==================== COMPRAS E PAGAMENTOS ====================

  async createPurchase(cardId, quantity = 1) {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    return await db.createPurchase(sessionResult.user.id, cardId, quantity)
  }

  async getPurchases() {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    try {
      const { data, error } = await db.supabase
        .from('user_purchases')
        .select(`
          *,
          scratch_cards (title, image_url, category)
        `)
        .eq('user_id', sessionResult.user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async confirmPayment(purchaseId, externalId = null) {
    return await db.confirmPayment(purchaseId, externalId)
  }

  // ==================== JOGOS ====================

  async playGame(purchaseId, cardId) {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    return await db.playGame(sessionResult.user.id, purchaseId, cardId)
  }

  async getGameHistory() {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    try {
      const { data, error } = await db.supabase
        .from('user_games')
        .select(`
          *,
          scratch_cards (title, category),
          prizes (name, value, prize_type)
        `)
        .eq('user_id', sessionResult.user.id)
        .order('played_at', { ascending: false })

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== PRÊMIOS ====================

  async getUserPrizes() {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

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
        .eq('user_id', sessionResult.user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async claimPrize(prizeId, deliveryInfo = {}) {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    try {
      const { data, error } = await db.supabase
        .from('user_prizes')
        .update({
          status: 'claimed',
          delivery_info: deliveryInfo,
          claimed_at: new Date().toISOString()
        })
        .eq('id', prizeId)
        .eq('user_id', sessionResult.user.id)
        .select()
        .single()

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== TRANSAÇÕES ====================

  async getTransactions() {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    try {
      const { data, error } = await db.supabase
        .from('pix_transactions')
        .select('*')
        .eq('user_id', sessionResult.user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== PIX ====================

  async createPixDeposit(amount, userInfo) {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    try {
      // Gerar código PIX
      const pixCode = `PIX${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      const qrCode = this.generateQRCode(pixCode, amount)

      // Criar transação
      const { data, error } = await db.supabase
        .from('pix_transactions')
        .insert({
          user_id: sessionResult.user.id,
          transaction_type: 'deposit',
          amount,
          pix_code: pixCode,
          qr_code_data: qrCode,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      return {
        success: true,
        data: {
          transaction_id: data.id,
          pix_code: pixCode,
          qr_code: qrCode,
          amount,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  generateQRCode(pixCode, amount) {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white" stroke="black"/>
        <text x="100" y="90" text-anchor="middle" font-size="12" font-family="Arial">
          PIX QR Code
        </text>
        <text x="100" y="110" text-anchor="middle" font-size="10" font-family="Arial">
          R$ ${amount.toFixed(2)}
        </text>
        <text x="100" y="130" text-anchor="middle" font-size="8" font-family="Arial">
          ${pixCode}
        </text>
      </svg>
    `)}`
  }

  // ==================== ESTATÍSTICAS ====================

  async getUserStats() {
    const token = localStorage.getItem('user_token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const sessionResult = await db.verifyUserSession(token)
    if (!sessionResult.success) {
      throw new Error('Sessão inválida')
    }

    return await db.getUserStats(sessionResult.user.id)
  }
}

// Instância global da API
export const api = new LocalAPI()

// Compatibilidade com código existente
export default api