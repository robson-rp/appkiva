@extends('emails.layout')

@section('title', 'Bem-vindo(a) ao KIVARA')

@section('content')

  <h1 style="font-size:22px;font-weight:700;color:#0d2240;margin:0 0 8px;font-family:'Segoe UI',Arial,sans-serif;">
    Bem-vindo(a) ao KIVARA, {{ $displayName }}!
  </h1>
  <p style="font-size:15px;line-height:1.6;color:#3a5270;margin:0 0 20px;font-family:'Segoe UI',Arial,sans-serif;">
    A tua conta foi criada com sucesso. Estamos muito contentes por teres juntado à comunidade KIVARA.
  </p>

  {{-- Feature cards --}}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr>
      <td style="background:#f0f4f8;border-radius:12px;padding:16px 20px;border-left:4px solid #1e4d8a;margin-bottom:10px;">
        <span style="font-size:14px;font-weight:600;color:#1e4d8a;font-family:'Segoe UI',Arial,sans-serif;">Gestão financeira familiar</span>
        <p style="font-size:13px;color:#4a6080;margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;">Controla carteiras, poupanças e mesadas num só lugar</p>
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>
    <tr>
      <td style="background:#f0f4f8;border-radius:12px;padding:16px 20px;border-left:4px solid #2f9d78;">
        <span style="font-size:14px;font-weight:600;color:#2f9d78;font-family:'Segoe UI',Arial,sans-serif;">Lições de educação financeira</span>
        <p style="font-size:13px;color:#4a6080;margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;">Aprende a poupar, investir e gerir dinheiro com conteúdo interativo</p>
      </td>
    </tr>
    <tr><td style="height:8px;"></td></tr>
    <tr>
      <td style="background:#f0f4f8;border-radius:12px;padding:16px 20px;border-left:4px solid #f3af30;">
        <span style="font-size:14px;font-weight:600;color:#c87f00;font-family:'Segoe UI',Arial,sans-serif;">Tarefas e recompensas</span>
        <p style="font-size:13px;color:#4a6080;margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;">Motiva os teus filhos com missões e pontos KIVA</p>
      </td>
    </tr>
  </table>

  <div style="text-align:center;margin:28px 0;">
    <a href="{{ $appUrl }}" style="display:inline-block;padding:14px 40px;background:#1e4d8a;color:#ffffff;text-decoration:none;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;font-family:'Segoe UI',Arial,sans-serif;">
      Entrar na minha conta
    </a>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dde6f0;margin-top:28px;padding-top:20px;">
    <tr>
      <td>
        <p style="font-size:13px;color:#7a94b0;margin:0;font-family:'Segoe UI',Arial,sans-serif;">
          Tens dúvidas? Contacta-nos em
          <a href="mailto:suporte@kivara.app" style="color:#1e4d8a;text-decoration:none;">suporte@kivara.app</a>
        </p>
      </td>
    </tr>
  </table>

@endsection
