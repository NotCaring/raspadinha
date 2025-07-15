<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host = 'localhost';
$dbname = 'raspadinha_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api.php', '', $path);

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Route handling
switch ($path) {
    case '/pix/create':
        if ($method === 'POST') {
            createPixTransaction($pdo, $input);
        }
        break;
        
    case '/pix/webhook':
        if ($method === 'POST') {
            handlePixWebhook($pdo, $input);
        }
        break;
        
    case '/users':
        if ($method === 'GET') {
            getUsers($pdo);
        } elseif ($method === 'POST') {
            createUser($pdo, $input);
        }
        break;
        
    case '/scratch-cards':
        if ($method === 'GET') {
            getScratchCards($pdo);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

function createPixTransaction($pdo, $data) {
    try {
        // Validate required fields
        $required = ['username', 'email', 'phone', 'cpf', 'amount'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("Campo obrigatório: $field");
            }
        }

        // Clean and validate data
        $username = trim($data['username']);
        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        $phone = preg_replace('/\D/', '', $data['phone']);
        $document = preg_replace('/\D/', '', $data['cpf']);
        $amount = floatval($data['amount']);

        if (!$email) {
            throw new Exception('Email inválido');
        }

        if (strlen($phone) < 10 || strlen($phone) > 11) {
            throw new Exception('Telefone inválido');
        }

        if (strlen($document) !== 11 && strlen($document) !== 14) {
            throw new Exception('Documento inválido');
        }

        if ($amount < 10) {
            throw new Exception('Valor mínimo é R$ 10,00');
        }

        // Generate PIX code (simplified - in production use a real PIX provider)
        $pixCode = generatePixCode($amount, $username);
        $qrCode = generateQRCode($pixCode);
        
        // Insert transaction
        $stmt = $pdo->prepare("
            INSERT INTO pix_transactions 
            (user_id, transaction_type, amount, pix_code, qr_code, status, created_at) 
            VALUES (?, 'deposit', ?, ?, ?, 'pending', NOW())
        ");
        
        // For now, we'll use email as user identifier
        $stmt->execute([
            $email,
            $amount,
            $pixCode,
            $qrCode
        ]);

        $transactionId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'transaction_id' => $transactionId,
            'pix_code' => $pixCode,
            'qr_code' => $qrCode,
            'amount' => $amount,
            'expires_at' => date('Y-m-d H:i:s', strtotime('+1 hour'))
        ]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function handlePixWebhook($pdo, $data) {
    try {
        // Process webhook data from PIX provider
        $transactionId = $data['transaction_id'] ?? null;
        $status = $data['status'] ?? 'failed';
        $externalId = $data['external_id'] ?? null;

        if (!$transactionId) {
            throw new Exception('Transaction ID required');
        }

        // Update transaction status
        $stmt = $pdo->prepare("
            UPDATE pix_transactions 
            SET status = ?, external_id = ?, webhook_data = ?, processed_at = NOW() 
            WHERE id = ?
        ");
        
        $stmt->execute([
            $status,
            $externalId,
            json_encode($data),
            $transactionId
        ]);

        // If payment completed, update user balance
        if ($status === 'completed') {
            $stmt = $pdo->prepare("
                SELECT user_id, amount FROM pix_transactions WHERE id = ?
            ");
            $stmt->execute([$transactionId]);
            $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($transaction) {
                // Update user balance (simplified - in production you'd have proper user management)
                $stmt = $pdo->prepare("
                    UPDATE users 
                    SET balance = balance + ?, total_deposited = total_deposited + ? 
                    WHERE email = ?
                ");
                $stmt->execute([
                    $transaction['amount'],
                    $transaction['amount'],
                    $transaction['user_id']
                ]);
            }
        }

        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function getUsers($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $users
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function createUser($pdo, $data) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, phone, document, password_hash, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $data['username'],
            $data['email'],
            $data['phone'],
            $data['document'],
            password_hash($data['password'], PASSWORD_DEFAULT)
        ]);

        echo json_encode([
            'success' => true,
            'user_id' => $pdo->lastInsertId()
        ]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function getScratchCards($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT sc.*, 
                   COUNT(p.id) as prize_count,
                   AVG(p.value) as avg_prize_value
            FROM scratch_cards sc
            LEFT JOIN prizes p ON sc.id = p.scratch_card_id AND p.is_active = 1
            WHERE sc.is_active = 1
            GROUP BY sc.id
            ORDER BY sc.created_at DESC
        ");
        $stmt->execute();
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $cards
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function generatePixCode($amount, $username) {
    // Simplified PIX code generation
    // In production, integrate with a real PIX provider like PagSeguro, Mercado Pago, etc.
    $timestamp = time();
    $hash = md5($amount . $username . $timestamp);
    return "PIX" . strtoupper(substr($hash, 0, 20));
}

function generateQRCode($pixCode) {
    // Simplified QR code generation
    // In production, generate actual QR code image or use PIX provider's QR code
    return "data:image/svg+xml;base64," . base64_encode("
        <svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'>
            <rect width='200' height='200' fill='white'/>
            <text x='100' y='100' text-anchor='middle' font-family='Arial' font-size='12'>
                QR Code: $pixCode
            </text>
        </svg>
    ");
}
?>