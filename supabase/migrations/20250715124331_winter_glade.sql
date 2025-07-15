-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS raspadinha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE raspadinha_db;

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    document VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_deposited DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de raspadinhas
CREATE TABLE IF NOT EXISTS scratch_cards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    total_cards INT NOT NULL DEFAULT 0,
    sold_cards INT DEFAULT 0,
    win_probability DECIMAL(5,4) DEFAULT 0.1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de prêmios
CREATE TABLE IF NOT EXISTS prizes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    scratch_card_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    image_url VARCHAR(500),
    quantity INT DEFAULT 1,
    remaining_quantity INT DEFAULT 1,
    prize_type ENUM('physical', 'money', 'bonus') DEFAULT 'physical',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scratch_card_id) REFERENCES scratch_cards(id) ON DELETE CASCADE
);

-- Tabela de compras dos usuários
CREATE TABLE IF NOT EXISTS user_purchases (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    scratch_card_id VARCHAR(36),
    quantity INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'pix',
    pix_code VARCHAR(255),
    pix_qr_code TEXT,
    expires_at TIMESTAMP,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scratch_card_id) REFERENCES scratch_cards(id) ON DELETE CASCADE
);

-- Tabela de jogos/resultados
CREATE TABLE IF NOT EXISTS user_games (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    purchase_id VARCHAR(36),
    scratch_card_id VARCHAR(36),
    prize_id VARCHAR(36),
    is_winner BOOLEAN DEFAULT FALSE,
    game_result JSON,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES user_purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (scratch_card_id) REFERENCES scratch_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE SET NULL
);

-- Tabela de prêmios ganhos
CREATE TABLE IF NOT EXISTS user_prizes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    game_id VARCHAR(36),
    prize_id VARCHAR(36),
    status ENUM('pending', 'claimed', 'delivered') DEFAULT 'pending',
    delivery_address JSON,
    tracking_code VARCHAR(255),
    claimed_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES user_games(id) ON DELETE CASCADE,
    FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE
);

-- Tabela de transações PIX
CREATE TABLE IF NOT EXISTS pix_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(255), -- Pode ser email temporariamente
    purchase_id VARCHAR(36),
    transaction_type ENUM('deposit', 'withdrawal', 'purchase'),
    amount DECIMAL(10,2) NOT NULL,
    pix_key VARCHAR(255),
    pix_code VARCHAR(255),
    qr_code TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    external_id VARCHAR(255),
    webhook_data JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES user_purchases(id) ON DELETE SET NULL
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    description TEXT,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES admins(id)
);

-- Inserir admin padrão
INSERT INTO admins (email, password_hash, name, role) VALUES 
('admin@raspadinha.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'super_admin');

-- Inserir configurações padrão
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
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
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10' LIMIT 1), 'R$ 50,00', 'Cinquenta reais em dinheiro', 50.00, 'money', 50, 50),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10' LIMIT 1), 'R$ 100,00', 'Cem reais em dinheiro', 100.00, 'money', 20, 20),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Dinheiro R$ 10' LIMIT 1), 'R$ 500,00', 'Quinhentos reais em dinheiro', 500.00, 'money', 5, 5),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Eletrônicos' LIMIT 1), 'iPhone 15', 'iPhone 15 128GB', 4500.00, 'physical', 2, 2),
((SELECT id FROM scratch_cards WHERE title = 'Raspadinha Eletrônicos' LIMIT 1), 'Samsung Galaxy S24', 'Samsung Galaxy S24 256GB', 3500.00, 'physical', 3, 3);