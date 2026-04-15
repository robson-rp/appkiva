<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@yield('title', 'KIVARA')</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;color:#0d2240;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,34,64,0.10);">

          {{-- Header --}}
          <tr>
            <td style="background:linear-gradient(135deg,#1e4d8a 0%,#122f54 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;">
                <span style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:3px;font-family:'Segoe UI',Arial,sans-serif;">KIVARA</span>
              </div>
              <div style="margin-top:6px;">
                <span style="font-size:12px;color:#a8c4e8;letter-spacing:2px;text-transform:uppercase;font-family:'Segoe UI',Arial,sans-serif;">Educação Financeira</span>
              </div>
            </td>
          </tr>

          {{-- Accent bar --}}
          <tr>
            <td style="background:linear-gradient(90deg,#f3af30,#2f9d78);height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          {{-- Body --}}
          <tr>
            <td style="padding:40px;">
              @yield('content')
            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="background:#f0f4f8;padding:24px 40px;text-align:center;border-top:1px solid #dde6f0;">
              <p style="margin:0 0 4px;font-size:12px;color:#7a94b0;font-family:'Segoe UI',Arial,sans-serif;">© {{ date('Y') }} KIVARA — Educação Financeira para Todos</p>
              <p style="margin:0;font-size:12px;color:#7a94b0;font-family:'Segoe UI',Arial,sans-serif;">Este email foi enviado automaticamente. Por favor não responda.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
