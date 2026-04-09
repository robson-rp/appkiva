<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Kiva') }}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0f1b0f;
            color: #c8ddb0;
            font-family: Georgia, 'Times New Roman', serif;
        }

        .card {
            text-align: center;
            max-width: 500px;
            padding: 3rem 2rem;
        }

        .name {
            font-size: 2.8rem;
            font-weight: normal;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: #e8f5d0;
            margin-bottom: 0.4rem;
        }

        .tagline {
            font-size: 0.7rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #6a9a50;
            margin-bottom: 2rem;
        }

        .divider {
            width: 40px;
            height: 1px;
            background: #4a7a30;
            margin: 0 auto 2rem;
        }

        .verse {
            font-size: 1.05rem;
            line-height: 2;
            color: #8aaa78;
            font-style: italic;
        }

        .coin {
            display: block;
            font-size: 1.8rem;
            margin-bottom: 1.8rem;
        }

        .dot {
            display: block;
            margin-top: 2.5rem;
            font-size: 0.6rem;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #2a4a20;
        }
    </style>
</head>
<body>
    <div class="card">
        <span class="coin">🌱</span>
        <h1 class="name">{{ config('app.name', 'Kiva') }}</h1>
        <p class="tagline">Financial literacy for children</p>
        <div class="divider"></div>
        <p class="verse">
            Every coin saved is a seed planted.<br>
            Every seed planted is a future grown.
        </p>
        <span class="dot">{{ config('app.env', 'production') }}</span>
    </div>
</body>
</html>
