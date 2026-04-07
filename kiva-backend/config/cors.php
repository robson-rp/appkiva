<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'https://kivara.app',
    ],
    'allowed_origins_patterns' => [
        '#^https://.*\.kivara\.app$#',
        '#^http://localhost(:\d+)?$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
