<?php
// Recebe o JSON enviado no corpo da requisição
$json = file_get_contents('php://input');
$dataInput = json_decode($json, true);

header('Content-Type: application/json');

// Validação básica
if (!$dataInput) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido ou vazio']);
    exit;
}

// Token da API Nitro e endpoint
$apiToken = 'AJTQzn8xWuYXrjNu5XWajspWi8i6sd9XzkgEViaDpkIrwyKRKCkC1fHCFY1P';
$endpoint = 'https://api.nitropagamentos.com/api/public/v1/transactions?api_token=' . $apiToken;

// Extrai e sanitiza os dados recebidos
$name = $dataInput['username'] ?? 'Cliente Teste';
$email = $dataInput['email'] ?? 'cliente@teste.com';
$phone = preg_replace('/\D/', '', $dataInput['phone'] ?? '');
$document = preg_replace('/\D/', '', $dataInput['cpf'] ?? '');
$amount = intval($dataInput['amount'] ?? 1790);  // valor em centavos

// Monta o payload para API Nitro
$data = [
    "amount" => $amount,
    "offer_hash" => "ydpamubeay",
    "payment_method" => "pix",
    "customer" => [
        "name" => $name,
        "email" => $email,
        "phone_number" => $phone,
        "document" => $document,
        "street_name" => "",
        "number" => "",
        "complement" => "",
        "neighborhood" => "",
        "city" => "",
        "state" => "",
        "zip_code" => ""
    ],
    "cart" => [
        [
            "product_hash" => "8cru5klgqv",
            "title" => "Produto Teste API Publica",
            "cover" => null,
            "price" => $amount,
            "quantity" => 1,
            "operation_type" => 1,
            "tangible" => false
        ]
    ],
    "installments" => 1,
    "expire_in_days" => 1,
    "postback_url" => ""
];

// Chamada cURL para API Nitro
$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro na requisição: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
