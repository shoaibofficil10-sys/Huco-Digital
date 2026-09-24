<?php
declare(strict_types=1);

// Upload to PHP hosting with a working local mail service. No SMTP password is used.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$nativeForm = str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/x-www-form-urlencoded');

function respond(int $status, array $data): never {
    global $nativeForm;
    http_response_code($status);
    if ($nativeForm) {
        if ($status === 200 && ($data['ok'] ?? false) === true) {
            header('Location: thank-you.html', true, 303);
            exit;
        }
        header('Content-Type: text/html; charset=utf-8');
        $message = htmlspecialchars($data['error'] ?? 'Please try again.', ENT_QUOTES, 'UTF-8');
        echo '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Enquiry | HUCO Digital</title><style>body{font:18px/1.7 system-ui,sans-serif;background:#f7f6f2;color:#151515;margin:0;padding:12vh 24px}main{max-width:620px;margin:auto}h1{font-size:40px;line-height:1.1;letter-spacing:-.04em}a{color:#b51e26}p{color:#555}</style><main><p>HUCO / ENQUIRY</p><h1>Let’s try that again.</h1><p>' . $message . '</p><p><a href="contact.html#brief">Return to the contact form</a> · <a href="mailto:arsalan@hucodigital.com">Email your enquiry</a></p></main></html>';
        exit;
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://huco-digital.vercel.app', 'https://hucodigital.com', 'https://www.hucodigital.com'];
$originHost = parse_url($origin, PHP_URL_HOST);
$originPort = parse_url($origin, PHP_URL_PORT);
$sameHost = $originHost && ($originHost . ($originPort ? ':' . $originPort : '')) === ($_SERVER['HTTP_HOST'] ?? '');
if ($origin !== '') {
    if (!$sameHost && !in_array($origin, $allowedOrigins, true)) {
        respond(403, ['error' => 'Please submit from the HUCO website.']);
    }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}
if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['error' => 'Please submit the enquiry form.']);
}
if (!$nativeForm && !str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    respond(415, ['error' => 'Please use the website enquiry form.']);
}
$raw = file_get_contents('php://input', false, null, 0, 16001);
if ($raw === false || strlen($raw) > 16000) respond(413, ['error' => 'Please shorten your enquiry.']);
$body = $nativeForm ? $_POST : json_decode($raw, true);
if (!is_array($body) || array_is_list($body)) respond(400, ['error' => 'Please check your enquiry.']);
if (!empty($body['website'])) respond(400, ['error' => 'Please check your enquiry.']);

$limits = ['name'=>120, 'company'=>180, 'email'=>254, 'phone'=>60, 'service'=>180, 'budget'=>120, 'timeline'=>120, 'source'=>120, 'stage'=>180, 'goal'=>3000, 'message'=>5000, 'page'=>200];
$fields = [];
foreach ($limits as $key => $max) {
    if (!array_key_exists($key, $body)) continue;
    if (!is_string($body[$key]) || strlen($body[$key]) > $max || preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f]/', $body[$key])) {
        respond(400, ['error' => 'Please shorten the enquiry and check your details.']);
    }
    $fields[$key] = trim($body[$key]);
}
if (empty($fields['name']) || empty($fields['email']) || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)
    || preg_match('/[\r\n]/', $fields['name'] . ($fields['company'] ?? '') . $fields['email'])) {
    respond(400, ['error' => 'Please enter your name and a valid email address.']);
}

// One bounded rate-limit file per PHP worker host, outside the public directory.
$rateFile = sys_get_temp_dir() . '/huco-enquiry-' . hash('sha256', __DIR__) . '.json';
$handle = @fopen($rateFile, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) respond(503, ['error' => 'Online sending is temporarily unavailable. Please use the email link below.']);
@chmod($rateFile, 0600);
$now = time();
$rates = json_decode(stream_get_contents($handle), true) ?: [];
foreach ($rates as $key => $entry) if (($entry['expires'] ?? 0) <= $now) unset($rates[$key]);
$key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$entry = $rates[$key] ?? ['count'=>0, 'expires'=>$now + 600];
if ($entry['count'] >= 5 || count($rates) > 10000) {
    flock($handle, LOCK_UN); fclose($handle);
    header('Retry-After: 600');
    respond(429, ['error' => 'Please wait a few minutes or contact us by email.']);
}
$entry['count']++;
$rates[$key] = $entry;
ftruncate($handle, 0); rewind($handle); fwrite($handle, json_encode($rates));
flock($handle, LOCK_UN); fclose($handle);

$recipient = 'arsalan@hucodigital.com';
$subject = 'HUCO website enquiry';
if (!empty($fields['company'])) $subject .= ' — ' . $fields['company'];
$subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$message = "New HUCO Digital website enquiry\r\n\r\n";
foreach ($fields as $label => $value) $message .= ucfirst($label) . ': ' . str_replace(["\r\n", "\r"], "\n", $value) . "\r\n\r\n";
$headers = [
    'From' => 'HUCO Digital <info@hucodigital.com>',
    'Reply-To' => $fields['email'],
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit'
];
try {
    $accepted = function_exists('mail') && @mail($recipient, $subject, $message, $headers);
} catch (Throwable $error) {
    $accepted = false;
}
if (!$accepted) respond(502, ['error' => 'We could not confirm sending. Your details are still here; please try again or use the email link below.']);
respond(200, ['ok'=>true]);
