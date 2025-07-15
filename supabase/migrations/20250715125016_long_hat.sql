/*
  # Sistema Completo Raspadinha - Base de Dados

  1. Novas Tabelas
    - `users` - Usuários completos com autenticação
    - `scratch_cards` - Raspadinhas disponíveis
    - `user_purchases` - Compras e pagamentos
    - `user_games` - Jogos realizados
    - `pix_transactions` - Transações PIX
    - `prizes` - Prêmios disponíveis
    - `user_prizes` - Prêmios ganhos
    - `system_settings` - Configurações
    - `admins` - Administradores

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas para cada tipo de usuário
    - Autenticação segura

  3. Funcionalidades
    - Sistema completo de PIX
    - Gerenciamento de raspadinhas
    - Controle de prêmios
    - Estatísticas em tempo real
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (substitui auth.users para controle total)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  phone text,
  document text,
  password_hash text NOT NULL,
  balance decimal(10,2) DEFAULT 0.00,
  total_deposited decimal(10,2) DEFAULT 0.00,
  total_withdrawn decimal(10,2) DEFAULT 0.00,
  total_spent decimal(10,2) DEFAULT 0.00,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de raspadinhas
CREATE TABLE IF NOT EXISTS scratch_cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text DEFAULT '/assets/scratch.png',
  total_cards integer NOT NULL DEFAULT 1000,
  sold_cards integer DEFAULT 0,
  win_probability decimal(5,4) DEFAULT 0.1000,
  max_wins_per_card integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de prêmios
CREATE TABLE IF NOT EXISTS prizes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  scratch_card_id uuid REFERENCES scratch_cards(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  value decimal(10,2) DEFAULT 0,
  image_url text,
  quantity integer DEFAULT 1,
  remaining_quantity integer DEFAULT 1,
  prize_type text DEFAULT 'physical' CHECK (prize_type IN ('physical', 'money', 'bonus')),
  probability decimal(5,4) DEFAULT 0.1000,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de compras/pagamentos
CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  scratch_card_id uuid REFERENCES scratch_cards(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  payment_method text DEFAULT 'pix',
  pix_code text,
  pix_qr_code text,
  external_transaction_id text,
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela de jogos realizados
CREATE TABLE IF NOT EXISTS user_games (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  purchase_id uuid REFERENCES user_purchases(id) ON DELETE CASCADE,
  scratch_card_id uuid REFERENCES scratch_cards(id) ON DELETE CASCADE,
  prize_id uuid REFERENCES prizes(id) ON DELETE SET NULL,
  is_winner boolean DEFAULT false,
  prize_value decimal(10,2) DEFAULT 0,
  game_data jsonb DEFAULT '{}',
  played_at timestamptz DEFAULT now()
);

-- Tabela de prêmios ganhos pelos usuários
CREATE TABLE IF NOT EXISTS user_prizes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES user_games(id) ON DELETE CASCADE,
  prize_id uuid REFERENCES prizes(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'processing', 'delivered')),
  delivery_info jsonb DEFAULT '{}',
  tracking_code text,
  claimed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela de transações PIX
CREATE TABLE IF NOT EXISTS pix_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  purchase_id uuid REFERENCES user_purchases(id) ON DELETE SET NULL,
  transaction_type text CHECK (transaction_type IN ('deposit', 'withdrawal', 'purchase', 'prize_payment')),
  amount decimal(10,2) NOT NULL,
  pix_key text,
  pix_code text,
  qr_code_data text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  external_id text,
  webhook_data jsonb DEFAULT '{}',
  error_message text,
  processed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  created_at timestamptz DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  updated_by uuid REFERENCES admins(id),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de sessões de usuários
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de sessões de admin
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES admins(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE scratch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (id = auth.uid());

-- Políticas para raspadinhas (público pode ver ativas)
CREATE POLICY "Anyone can view active scratch cards" ON scratch_cards FOR SELECT USING (is_active = true);

-- Políticas para prêmios (público pode ver ativos)
CREATE POLICY "Anyone can view active prizes" ON prizes FOR SELECT USING (is_active = true);

-- Políticas para compras (usuários veem apenas suas)
CREATE POLICY "Users can view own purchases" ON user_purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create purchases" ON user_purchases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own purchases" ON user_purchases FOR UPDATE USING (user_id = auth.uid());

-- Políticas para jogos
CREATE POLICY "Users can view own games" ON user_games FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create games" ON user_games FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para prêmios de usuários
CREATE POLICY "Users can view own prizes" ON user_prizes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own prizes" ON user_prizes FOR UPDATE USING (user_id = auth.uid());

-- Políticas para transações PIX
CREATE POLICY "Users can view own transactions" ON pix_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create transactions" ON pix_transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para sessões
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create sessions" ON user_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (user_id = auth.uid());

-- Políticas para admin (acesso total quando autenticado como admin)
CREATE POLICY "Admins have full access" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can manage scratch cards" ON scratch_cards FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can manage prizes" ON prizes FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can view all purchases" ON user_purchases FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can view all games" ON user_games FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can manage user prizes" ON user_prizes FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can view all transactions" ON pix_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);
CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_sessions WHERE admin_sessions.token = current_setting('app.admin_token', true))
);

-- Inserir admin padrão
INSERT INTO admins (email, username, password_hash, name, role) VALUES 
('admin@raspadinha.com', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'super_admin');

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
('site_name', '"Raspadinha"', 'Nome do site', 'general'),
('site_description', '"Raspadinhas online com prêmios incríveis"', 'Descrição do site', 'general'),
('pix_enabled', 'true', 'PIX habilitado para pagamentos', 'payment'),
('min_deposit', '10.00', 'Valor mínimo de depósito em reais', 'payment'),
('max_deposit', '1000.00', 'Valor máximo de depósito em reais', 'payment'),
('min_purchase', '5.00', 'Valor mínimo de compra', 'payment'),
('withdrawal_fee', '2.00', 'Taxa de saque em reais', 'payment'),
('withdrawal_min', '20.00', 'Valor mínimo para saque', 'payment'),
('maintenance_mode', 'false', 'Modo manutenção ativo', 'system'),
('registration_enabled', 'true', 'Registro de novos usuários habilitado', 'system'),
('max_games_per_day', '50', 'Máximo de jogos por usuário por dia', 'game'),
('default_win_probability', '0.15', 'Probabilidade padrão de ganhar (15%)', 'game');

-- Inserir raspadinhas de exemplo
INSERT INTO scratch_cards (title, description, category, price, total_cards, win_probability, image_url) VALUES
('Raspadinha Dinheiro R$ 10', 'Ganhe até R$ 1.000 em dinheiro! Raspe e descubra se você é o próximo ganhador.', 'dinheiro', 10.00, 1000, 0.15, '/assets/scratch.png'),
('Raspadinha Eletrônicos', 'Ganhe smartphones, tablets, fones e muito mais! Tecnologia na palma da sua mão.', 'eletronicos', 25.00, 500, 0.12, '/assets/scratch.png'),
('Raspadinha Eletrodomésticos', 'Ganhe geladeira, fogão, micro-ondas e outros eletrodomésticos para sua casa!', 'eletrodomesticos', 35.00, 300, 0.10, '/assets/scratch.png'),
('Raspadinha Camisa de Futebol', 'Ganhe camisas oficiais dos seus times favoritos! Para os verdadeiros torcedores.', 'camisa-de-futebol', 15.00, 800, 0.18, '/assets/scratch.png'),
('Raspadinha Premium R$ 50', 'Prêmios exclusivos e valores altos! Para quem quer apostar alto e ganhar muito.', 'dinheiro', 50.00, 200, 0.08, '/assets/scratch.png');

-- Inserir prêmios para cada raspadinha
DO $$
DECLARE
    card_dinheiro_10 uuid;
    card_eletronicos uuid;
    card_eletrodomesticos uuid;
    card_camisa uuid;
    card_premium uuid;
BEGIN
    -- Buscar IDs das raspadinhas
    SELECT id INTO card_dinheiro_10 FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10';
    SELECT id INTO card_eletronicos FROM scratch_cards WHERE title = 'Raspadinha Eletrônicos';
    SELECT id INTO card_eletrodomesticos FROM scratch_cards WHERE title = 'Raspadinha Eletrodomésticos';
    SELECT id INTO card_camisa FROM scratch_cards WHERE title = 'Raspadinha Camisa de Futebol';
    SELECT id INTO card_premium FROM scratch_cards WHERE title = 'Raspadinha Premium R$ 50';

    -- Prêmios para Raspadinha Dinheiro R$ 10
    INSERT INTO prizes (scratch_card_id, name, description, value, prize_type, quantity, remaining_quantity, probability) VALUES
    (card_dinheiro_10, 'R$ 20,00', 'Vinte reais em dinheiro', 20.00, 'money', 80, 80, 0.08),
    (card_dinheiro_10, 'R$ 50,00', 'Cinquenta reais em dinheiro', 50.00, 'money', 40, 40, 0.04),
    (card_dinheiro_10, 'R$ 100,00', 'Cem reais em dinheiro', 100.00, 'money', 20, 20, 0.02),
    (card_dinheiro_10, 'R$ 500,00', 'Quinhentos reais em dinheiro', 500.00, 'money', 5, 5, 0.005),
    (card_dinheiro_10, 'R$ 1.000,00', 'Mil reais em dinheiro', 1000.00, 'money', 2, 2, 0.002);

    -- Prêmios para Raspadinha Eletrônicos
    INSERT INTO prizes (scratch_card_id, name, description, value, prize_type, quantity, remaining_quantity, probability) VALUES
    (card_eletronicos, 'Fone Bluetooth', 'Fone de ouvido Bluetooth premium', 150.00, 'physical', 30, 30, 0.06),
    (card_eletronicos, 'Tablet Android', 'Tablet Android 10 polegadas', 800.00, 'physical', 15, 15, 0.03),
    (card_eletronicos, 'Smartphone', 'Smartphone Android 128GB', 1200.00, 'physical', 8, 8, 0.016),
    (card_eletronicos, 'iPhone 15', 'iPhone 15 128GB', 4500.00, 'physical', 2, 2, 0.004),
    (card_eletronicos, 'Samsung Galaxy S24', 'Samsung Galaxy S24 256GB', 3500.00, 'physical', 3, 3, 0.006);

    -- Prêmios para Raspadinha Eletrodomésticos
    INSERT INTO prizes (scratch_card_id, name, description, value, prize_type, quantity, remaining_quantity, probability) VALUES
    (card_eletrodomesticos, 'Micro-ondas', 'Micro-ondas 30L digital', 400.00, 'physical', 20, 20, 0.067),
    (card_eletrodomesticos, 'Air Fryer', 'Fritadeira elétrica sem óleo 5L', 300.00, 'physical', 15, 15, 0.05),
    (card_eletrodomesticos, 'Geladeira', 'Geladeira Frost Free 300L', 1800.00, 'physical', 5, 5, 0.017),
    (card_eletrodomesticos, 'Fogão 4 Bocas', 'Fogão 4 bocas com forno', 800.00, 'physical', 8, 8, 0.027),
    (card_eletrodomesticos, 'Máquina de Lavar', 'Máquina de lavar 12kg', 1500.00, 'physical', 3, 3, 0.01);

    -- Prêmios para Raspadinha Camisa de Futebol
    INSERT INTO prizes (scratch_card_id, name, description, value, prize_type, quantity, remaining_quantity, probability) VALUES
    (card_camisa, 'Camisa Nacional', 'Camisa oficial do time nacional', 120.00, 'physical', 50, 50, 0.0625),
    (card_camisa, 'Camisa Internacional', 'Camisa oficial internacional', 150.00, 'physical', 40, 40, 0.05),
    (card_camisa, 'Camisa Seleção', 'Camisa oficial da seleção brasileira', 200.00, 'physical', 30, 30, 0.0375),
    (card_camisa, 'Kit Completo', 'Kit completo com camisa, shorts e meião', 300.00, 'physical', 20, 20, 0.025),
    (card_camisa, 'Camisa Autografada', 'Camisa autografada por jogador famoso', 800.00, 'physical', 5, 5, 0.00625);

    -- Prêmios para Raspadinha Premium
    INSERT INTO prizes (scratch_card_id, name, description, value, prize_type, quantity, remaining_quantity, probability) VALUES
    (card_premium, 'R$ 100,00', 'Cem reais em dinheiro', 100.00, 'money', 10, 10, 0.05),
    (card_premium, 'R$ 500,00', 'Quinhentos reais em dinheiro', 500.00, 'money', 8, 8, 0.04),
    (card_premium, 'R$ 1.000,00', 'Mil reais em dinheiro', 1000.00, 'money', 5, 5, 0.025),
    (card_premium, 'R$ 5.000,00', 'Cinco mil reais em dinheiro', 5000.00, 'money', 2, 2, 0.01),
    (card_premium, 'R$ 10.000,00', 'Dez mil reais em dinheiro', 10000.00, 'money', 1, 1, 0.005);
END $$;

-- Funções auxiliares para o sistema

-- Função para gerar token de sessão
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS text AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário pode jogar
CREATE OR REPLACE FUNCTION can_user_play(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
    games_today integer;
    max_games integer;
BEGIN
    -- Buscar configuração de máximo de jogos por dia
    SELECT (setting_value::text)::integer INTO max_games 
    FROM system_settings 
    WHERE setting_key = 'max_games_per_day';
    
    -- Contar jogos do usuário hoje
    SELECT COUNT(*) INTO games_today
    FROM user_games
    WHERE user_id = user_uuid 
    AND played_at >= CURRENT_DATE;
    
    RETURN games_today < COALESCE(max_games, 50);
END;
$$ LANGUAGE plpgsql;

-- Função para processar resultado do jogo
CREATE OR REPLACE FUNCTION process_game_result(
    p_user_id uuid,
    p_purchase_id uuid,
    p_scratch_card_id uuid
)
RETURNS jsonb AS $$
DECLARE
    v_is_winner boolean := false;
    v_prize_id uuid;
    v_prize_value decimal(10,2) := 0;
    v_prize_name text;
    v_card_probability decimal(5,4);
    v_random_value decimal(5,4);
    v_game_id uuid;
    v_result jsonb;
BEGIN
    -- Verificar se usuário pode jogar
    IF NOT can_user_play(p_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Limite de jogos diário atingido'
        );
    END IF;

    -- Buscar probabilidade da raspadinha
    SELECT win_probability INTO v_card_probability
    FROM scratch_cards
    WHERE id = p_scratch_card_id;

    -- Gerar número aleatório
    v_random_value := random();

    -- Verificar se ganhou
    IF v_random_value <= v_card_probability THEN
        v_is_winner := true;
        
        -- Selecionar prêmio aleatório disponível
        SELECT id, value, name INTO v_prize_id, v_prize_value, v_prize_name
        FROM prizes
        WHERE scratch_card_id = p_scratch_card_id
        AND remaining_quantity > 0
        AND is_active = true
        ORDER BY random()
        LIMIT 1;

        -- Se encontrou prêmio, decrementar quantidade
        IF v_prize_id IS NOT NULL THEN
            UPDATE prizes
            SET remaining_quantity = remaining_quantity - 1
            WHERE id = v_prize_id;
        ELSE
            v_is_winner := false;
        END IF;
    END IF;

    -- Inserir registro do jogo
    INSERT INTO user_games (user_id, purchase_id, scratch_card_id, prize_id, is_winner, prize_value, game_data)
    VALUES (p_user_id, p_purchase_id, p_scratch_card_id, v_prize_id, v_is_winner, v_prize_value, 
            jsonb_build_object('random_value', v_random_value, 'probability', v_card_probability))
    RETURNING id INTO v_game_id;

    -- Se ganhou, criar registro de prêmio
    IF v_is_winner AND v_prize_id IS NOT NULL THEN
        INSERT INTO user_prizes (user_id, game_id, prize_id)
        VALUES (p_user_id, v_game_id, v_prize_id);

        -- Se prêmio é dinheiro, adicionar ao saldo
        IF (SELECT prize_type FROM prizes WHERE id = v_prize_id) = 'money' THEN
            UPDATE users
            SET balance = balance + v_prize_value
            WHERE id = p_user_id;
        END IF;
    END IF;

    -- Atualizar estatísticas do usuário
    UPDATE users
    SET games_played = games_played + 1,
        games_won = games_won + CASE WHEN v_is_winner THEN 1 ELSE 0 END
    WHERE id = p_user_id;

    -- Preparar resultado
    v_result := jsonb_build_object(
        'success', true,
        'game_id', v_game_id,
        'is_winner', v_is_winner,
        'prize_id', v_prize_id,
        'prize_name', v_prize_name,
        'prize_value', v_prize_value
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_played_at ON user_games(played_at);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_status ON pix_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);