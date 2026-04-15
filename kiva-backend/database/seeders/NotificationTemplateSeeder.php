<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            ['event' => 'task_created',      'recipient_role' => 'child',  'title_template' => 'Nova tarefa!',          'message_template' => 'Tens uma nova tarefa: {task_name}'],
            ['event' => 'task_completed',    'recipient_role' => 'parent', 'title_template' => 'Tarefa concluída',      'message_template' => '{child_name} completou a tarefa: {task_name}'],
            ['event' => 'task_approved',     'recipient_role' => 'child',  'title_template' => 'Tarefa aprovada!',      'message_template' => 'A tua tarefa {task_name} foi aprovada. Ganhaste {points} pontos!'],
            ['event' => 'lesson_completed',  'recipient_role' => 'self',   'title_template' => 'Lição concluída',       'message_template' => 'Parabéns! Completaste a lição e ganhaste {points} Kiva Points.'],
            ['event' => 'donation_made',     'recipient_role' => 'self',   'title_template' => 'Doação realizada',      'message_template' => 'A tua doação de {amount} foi registada com sucesso.'],
            ['event' => 'reward_claimed',    'recipient_role' => 'parent', 'title_template' => 'Recompensa resgatada',  'message_template' => '{child_name} resgatou a recompensa: {reward_name}'],
            ['event' => 'allowance_sent',    'recipient_role' => 'child',  'title_template' => 'Mesada recebida!',      'message_template' => 'Recebeste {amount} de mesada.'],
            ['event' => 'vault_deposit',     'recipient_role' => 'self',   'title_template' => 'Depósito no cofre',     'message_template' => 'Depositaste {amount} no cofre {vault_name}.'],
            ['event' => 'streak_milestone',  'recipient_role' => 'self',   'title_template' => 'Sequência!',            'message_template' => 'Atingiste {days} dias consecutivos! Continua assim!'],
            ['event' => 'badge_unlocked',    'recipient_role' => 'self',   'title_template' => 'Badge desbloqueado!',   'message_template' => 'Desbloqueaste o badge: {badge_name}'],
            ['event' => 'level_up',          'recipient_role' => 'self',   'title_template' => 'Subiste de nível!',     'message_template' => 'Parabéns! Agora és nível {level}.'],
            ['event' => 'budget_warning',    'recipient_role' => 'self',   'title_template' => 'Aviso de orçamento',    'message_template' => 'Atenção: já gastaste {percent}% do teu orçamento mensal.'],
            ['event' => 'system_broadcast',  'recipient_role' => 'all',    'title_template' => 'Aviso do sistema',      'message_template' => '{message}'],
        ];

        foreach ($events as $e) {
            NotificationTemplate::firstOrCreate(['event' => $e['event']], $e);
        }
    }
}
