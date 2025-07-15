/*
  # Painel Admin - Estrutura do Banco de Dados

  1. Novas Tabelas
    - `admins` - Administradores do sistema
    - `users` - Usuários do sistema
    - `scratch_cards` - Raspadinhas disponíveis
    - `user_purchases` - Compras dos usuários
    - `user_games` - Jogos/resultados dos usuários
    - `pix_transactions` - Transações PIX
    - `prizes` - Prêmios disponíveis
    - `user_prizes` - Prêmios ganhos pelos usuários
    - `system_settings` - Configurações do sistema

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas para admin e usuários
*/

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  phone text,
  document text,
  password_hash text NOT NULL,
  balance decimal(10,2) DEFAULT 0.00,
  total_deposited decimal(10,2) DEFAULT 0.00,
  total_withdrawn decimal(10,2) DEFAULT 0.00,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de raspadinhas
CREATE TABLE IF NOT EXISTS scratch_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text,
  total_cards integer NOT NULL DEFAULT 0,
  sold_cards integer DEFAULT 0,
  win_probability decimal(5,4) DEFAULT 0.1000, -- 10% chance de ganhar
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de prêmios
CREATE TABLE IF NOT EXISTS prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scratch_card_id uuid REFERENCES scratch_cards(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  value decimal(10,2),
  image_url text,
  quantity integer DEFAULT 1,
  remaining_quantity integer DEFAULT 1,
  prize_type text DEFAULT 'physical' CHECK (prize_type IN ('physical', 'money', 'bonus')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de compras dos usuários
CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  scratch_card_id uuid REFERENCES scratch_cards(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  total_amount decimal(10,2) NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text DEFAULT 'pix',
  pix_code text,
  pix_qr_code text,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela de jogos/resultados
CREATE TABLE IF NOT EXISTS user_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  purchase_id uuid REFERENCES user_purchases(id) ON DELETE CASCADE,
  scratch_card_id uuid REFERENCES scratch_cards(id) ON DELETE CASCADE,
  prize_id uuid REFERENCES prizes(id) ON DELETE SET NULL,
  is_winner boolean DEFAULT false,
  game_result jsonb, -- Resultado detalhado do jogo
  played_at timestamptz DEFAULT now()
);

-- Tabela de prêmios ganhos
CREATE TABLE IF NOT EXISTS user_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES user_games(id) ON DELETE CASCADE,
  prize_id uuid REFERENCES prizes(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'delivered')),
  delivery_address jsonb,
  tracking_code text,
  claimed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela de transações PIX
CREATE TABLE IF NOT EXISTS pix_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  purchase_id uuid REFERENCES user_purchases(id) ON DELETE SET NULL,
  transaction_type text CHECK (transaction_type IN ('deposit', 'withdrawal', 'purchase')),
  amount decimal(10,2) NOT NULL,
  pix_key text,
  pix_code text,
  qr_code text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  external_id text,
  webhook_data jsonb,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES admins(id),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scratch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para admins (acesso total)
CREATE POLICY "Admins can manage all data" ON admins FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage scratch cards" ON scratch_cards FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can manage prizes" ON prizes FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can view purchases" ON user_purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can view games" ON user_games FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage user prizes" ON user_prizes FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins can view transactions" ON pix_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL TO authenticated USING (true);

-- Políticas para usuários (acesso limitado aos próprios dados)
CREATE POLICY "Users can view own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can view active scratch cards" ON scratch_cards FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Users can view prizes" ON prizes FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Users can manage own purchases" ON user_purchases FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own games" ON user_games FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own prizes" ON user_prizes FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own transactions" ON pix_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (key, value, description) VALUES
('site_name', '"Raspadinha"', 'Nome do site'),
('pix_enabled', 'true', 'PIX habilitado'),
('min_deposit', '10.00', 'Valor mínimo de depósito'),
('max_deposit', '1000.00', 'Valor máximo de depósito'),
('withdrawal_fee', '0.00', 'Taxa de saque'),
('maintenance_mode', 'false', 'Modo manutenção');

-- Inserir raspadinhas de exemplo
INSERT INTO scratch_cards (title, description, category, price, total_cards, image_url) VALUES
('Raspadinha Dinheiro R$ 10', 'Ganhe até R$ 1.000 em dinheiro!', 'dinheiro', 10.00, 1000, '/assets/scratch.png'),
('Raspadinha Eletrônicos', 'Ganhe smartphones, tablets e mais!', 'eletronicos', 25.00, 500, '/assets/scratch.png'),
('Raspadinha Eletrodomésticos', 'Ganhe geladeira, fogão, micro-ondas!', 'eletrodomesticos', 35.00, 300, '/assets/scratch.png'),
('Raspadinha Camisa de Futebol', 'Ganhe camisas oficiais dos seus times!', 'camisa-de-futebol', 15.00, 800, '/assets/scratch.png');

-- Inserir prêmios de exemplo
INSERT INTO prizes (scratch_card_id, name, description, value, prize_type, quantity, remaining_quantity) VALUES
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10'), 'R$ 50,00', 'Cinquenta reais em dinheiro', 50.00, 'money', 50, 50),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10'), 'R$ 100,00', 'Cem reais em dinheiro', 100.00, 'money', 20, 20),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10'), 'R$ 500,00', 'Quinhentos reais em dinheiro', 500.00, 'money', 5, 5),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Eletrônicos'), 'iPhone 15', 'iPhone 15 128GB', 4500.00, 'physical', 2, 2),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Eletrônicos'), 'Samsung Galaxy S24', 'Samsung Galaxy S24 256GB', 3500.00, 'physical', 3, 3);