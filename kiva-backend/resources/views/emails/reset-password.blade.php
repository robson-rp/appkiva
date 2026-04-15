@extends('emails.layout')

@section('title', 'Recuperar Password — KIVARA')

@section('content')

  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-block;background:#e8f0fb;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;color:#1e4d8a;font-weight:700;font-family:'Segoe UI',Arial,sans-serif;">K</div>
  </div>

  <h1 style="font-size:22px;font-weight:700;color:#0d2240;margin:0 0 8px;text-align:center;font-family:'Segoe UI',Arial,sans-serif;">
    Recuperar a tua password
  </h1>
  <p style="font-size:15px;line-height:1.6;color:#3a5270;margin:0 0 20px;text-align:center;font-family:'Segoe UI',Arial,sans-serif;">
    Recebemos um pedido de recuperação de password para a tua conta KIVARA.
  </p>

  <div style="background:#f0f4f8;border-radius:12px;padding:20px 24px;margin:0 0 24px;border-left:4px solid #1e4d8a;">
    <p style="font-size:13px;color:#4a6080;margin:0;font-family:'Segoe UI',Arial,sans-serif;">
      Este link expira em <strong style="color:#0d2240;">{{ $expireMinutes }} minutos</strong>. Após esse período, precisarás de solicitar um novo.
    </p>
  </div>

  <div style="text-align:center;margin:28px 0;">
    <a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 40px;background:#1e4d8a;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;font-family:'Segoe UI',Arial,sans-serif;">
      Redefinir Password
    </a>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dde6f0;margin-top:28px;padding-top:20px;">
    <tr>
      <td>
        <p style="font-size:13px;color:#7a94b0;margin:0 0 10px;font-family:'Segoe UI',Arial,sans-serif;">
          Se o botão não funcionar, copia e cola este link no teu browser:
        </p>
        <p style="font-size:12px;color:#1e4d8a;word-break:break-all;margin:0 0 16px;font-family:'Segoe UI',Arial,sans-serif;">
          <a href="{{ $resetUrl }}" style="color:#1e4d8a;">{{ $resetUrl }}</a>
        </p>
        <p style="font-size:13px;color:#7a94b0;margin:0;font-family:'Segoe UI',Arial,sans-serif;">
          Se não solicitaste esta recuperação, ignora este email. A tua conta está segura.
        </p>
      </td>
    </tr>
  </table>

@endsection
