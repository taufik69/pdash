<?php
// PHP Proxy to bypass CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Configuration
$apiUrl = "https://fraudchecker.link/api/v1/qc/"; // Added trailing slash to match user's working curl
$apiKey = "c4f905ed02aa3fd8e2aeabbc8f4bd4f2";

// Get phone from POST data (handles both FormData and Form-Encoded)
$phone = isset($_POST['phone']) ? $_POST['phone'] : '';

// Validation
if (empty($phone)) {
    echo json_encode(["success" => false, "message" => "Phone number is required"]);
    exit;
}

// Initialize CURL
$ch = curl_init();

// Use http_build_query to send as application/x-www-form-urlencoded
$postFields = http_build_query(['phone' => $phone]);

curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Follow redirects if any
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Often needed on shared hosting
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/x-www-form-urlencoded"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo json_encode([
        "success" => false, 
        "message" => "Proxy Error: " . curl_error($ch)
    ]);
} else {
    // Forward the response and its status code
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>
