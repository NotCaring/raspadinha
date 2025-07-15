import { supabase } from './supabase.js'

// Classe principal para gerenciar o banco de dados
export class DatabaseService {
  constructor() {
    this.supabase = supabase
  }

  // ==================== AUTENTICAÇÃO ====================
  
  async loginUser(email, password) {
    try {
      // Buscar usuário por email
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        throw new Error('Usuário não encontrado ou inativo')
      }

      // Verificar senha (em produção usar bcrypt)
      // Por simplicidade, vamos usar comparação direta por enquanto
      if (password !== 'user123') { // Temporário
        throw new Error('Senha incorreta')
      }

      // Criar sessão
      const token = this.generateToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

      await this.supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString()
        })

      return {
        success: true,
        user,
        token,
        expires_at: expiresAt
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async registerUser(userData) {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .insert({
          email: userData.email,
          username: userData.username,
          phone: userData.phone,
          document: userData.document,
          password_hash: 'hashed_password', // Em produção usar bcrypt
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async loginAdmin(email, password) {
    try {
      const { data: admin, error } = await this.supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        throw new Error('Admin não encontrado')
      }

      // Verificar senha
      if (password !== 'admin123456') {
        throw new Error('Senha incorreta')
      }

      // Criar sessão admin
      const token = this.generateToken()
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas

      await this.supabase
        .from('admin_sessions')
        .insert({
          admin_id: admin.id,
          token,
          expires_at: expiresAt.toISOString()
        })

      // Atualizar último login
      await this.supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      return {
        success: true,
        admin,
        token,
        expires_at: expiresAt
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== RASPADINHAS ====================

  async getScratchCards(activeOnly = true) {
    try {
      let query = this.supabase
        .from('scratch_cards')
        .select(`
          *,
          prizes (
            id,
            name,
            description,
            value,
            prize_type,
            quantity,
            remaining_quantity,
            probability
          )
        `)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getScratchCard(id) {
    try {
      const { data, error } = await this.supabase
        .from('scratch_cards')
        .select(`
          *,
          prizes (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== COMPRAS E PAGAMENTOS ====================

  async createPurchase(userId, scratchCardId, quantity = 1) {
    try {
      // Buscar dados da raspadinha
      const { data: card } = await this.supabase
        .from('scratch_cards')
        .select('price, is_active')
        .eq('id', scratchCardId)
        .single()

      if (!card || !card.is_active) {
        throw new Error('Raspadinha não encontrada ou inativa')
      }

      const totalAmount = card.price * quantity

      // Criar compra
      const { data: purchase, error } = await this.supabase
        .from('user_purchases')
        .insert({
          user_id: userId,
          scratch_card_id: scratchCardId,
          quantity,
          unit_price: card.price,
          total_amount: totalAmount,
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Gerar PIX
      const pixData = await this.generatePix(purchase.id, totalAmount)

      // Atualizar compra com dados do PIX
      await this.supabase
        .from('user_purchases')
        .update({
          pix_code: pixData.pix_code,
          pix_qr_code: pixData.qr_code
        })
        .eq('id', purchase.id)

      return {
        success: true,
        purchase: {
          ...purchase,
          pix_code: pixData.pix_code,
          pix_qr_code: pixData.qr_code
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async generatePix(purchaseId, amount) {
    // Gerar código PIX simples (em produção integrar com API real)
    const pixCode = `PIX${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    const qrCode = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-size="10">
          PIX: R$ ${amount.toFixed(2)}
        </text>
      </svg>
    `)}`

    // Registrar transação PIX
    await this.supabase
      .from('pix_transactions')
      .insert({
        purchase_id: purchaseId,
        transaction_type: 'purchase',
        amount,
        pix_code: pixCode,
        qr_code_data: qrCode,
        status: 'pending'
      })

    return { pix_code: pixCode, qr_code: qrCode }
  }

  async confirmPayment(purchaseId, externalId = null) {
    try {
      // Atualizar status da compra
      const { error: purchaseError } = await this.supabase
        .from('user_purchases')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', purchaseId)

      if (purchaseError) throw new Error(purchaseError.message)

      // Atualizar transação PIX
      await this.supabase
        .from('pix_transactions')
        .update({
          status: 'completed',
          external_id: externalId,
          processed_at: new Date().toISOString()
        })
        .eq('purchase_id', purchaseId)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== JOGOS ====================

  async playGame(userId, purchaseId, scratchCardId) {
    try {
      // Verificar se a compra foi paga
      const { data: purchase } = await this.supabase
        .from('user_purchases')
        .select('payment_status, quantity')
        .eq('id', purchaseId)
        .eq('user_id', userId)
        .single()

      if (!purchase || purchase.payment_status !== 'paid') {
        throw new Error('Compra não encontrada ou não paga')
      }

      // Verificar quantos jogos já foram feitos para esta compra
      const { count: gamesPlayed } = await this.supabase
        .from('user_games')
        .select('*', { count: 'exact', head: true })
        .eq('purchase_id', purchaseId)

      if (gamesPlayed >= purchase.quantity) {
        throw new Error('Todos os jogos desta compra já foram utilizados')
      }

      // Processar jogo usando função do banco
      const { data: result, error } = await this.supabase
        .rpc('process_game_result', {
          p_user_id: userId,
          p_purchase_id: purchaseId,
          p_scratch_card_id: scratchCardId
        })

      if (error) throw new Error(error.message)

      return { success: true, result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== USUÁRIOS ====================

  async getUser(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getUserStats(userId) {
    try {
      // Buscar estatísticas do usuário
      const { data: user } = await this.supabase
        .from('users')
        .select('balance, total_deposited, total_withdrawn, games_played, games_won')
        .eq('id', userId)
        .single()

      // Buscar prêmios ganhos
      const { data: prizes } = await this.supabase
        .from('user_prizes')
        .select(`
          *,
          prizes (name, value, prize_type)
        `)
        .eq('user_id', userId)

      return {
        success: true,
        stats: {
          ...user,
          prizes_won: prizes?.length || 0,
          total_prize_value: prizes?.reduce((sum, p) => sum + (p.prizes?.value || 0), 0) || 0
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== ADMIN ====================

  async getAdminStats() {
    try {
      // Total de usuários
      const { count: totalUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Total de vendas pagas
      const { count: totalSales } = await this.supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid')

      // Receita total
      const { data: revenue } = await this.supabase
        .from('user_purchases')
        .select('total_amount')
        .eq('payment_status', 'paid')

      const totalRevenue = revenue?.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) || 0

      // Cards ativos
      const { count: activeCards } = await this.supabase
        .from('scratch_cards')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Jogos hoje
      const { count: gamesToday } = await this.supabase
        .from('user_games')
        .select('*', { count: 'exact', head: true })
        .gte('played_at', new Date().toISOString().split('T')[0])

      return {
        success: true,
        stats: {
          totalUsers: totalUsers || 0,
          totalSales: totalSales || 0,
          totalRevenue,
          activeCards: activeCards || 0,
          gamesToday: gamesToday || 0
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getAllUsers(page = 1, limit = 20) {
    try {
      const { data, error, count } = await this.supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw new Error(error.message)

      return { success: true, data, count }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async updateUser(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== CONFIGURAÇÕES ====================

  async getSettings() {
    try {
      const { data, error } = await this.supabase
        .from('system_settings')
        .select('*')
        .order('setting_key')

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async updateSetting(key, value) {
    try {
      const { data, error } = await this.supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==================== UTILITÁRIOS ====================

  generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36)
  }

  async verifyUserSession(token) {
    try {
      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .select(`
          *,
          users (*)
        `)
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session) {
        return { success: false, error: 'Sessão inválida ou expirada' }
      }

      return { success: true, user: session.users }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async verifyAdminSession(token) {
    try {
      const { data: session, error } = await this.supabase
        .from('admin_sessions')
        .select(`
          *,
          admins (*)
        `)
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session) {
        return { success: false, error: 'Sessão admin inválida ou expirada' }
      }

      return { success: true, admin: session.admins }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// Instância global do serviço
export const db = new DatabaseService()