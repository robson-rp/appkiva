import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import NotificationStats, { useNotificationStats } from '@/components/admin/NotificationStats';
import NotificationTemplateManager from '@/components/admin/NotificationTemplateManager';
import NotificationBroadcast from '@/components/admin/NotificationBroadcast';
import NotificationHistory from '@/components/admin/NotificationHistory';
import NotificationAnalytics from '@/components/admin/NotificationAnalytics';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminNotifications() {
  const { data: stats } = useNotificationStats();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-heading md:text-heading-lg font-display font-bold text-foreground">Notificações</h1>
        <p className="text-small text-muted-foreground mt-1">Templates, broadcast e histórico de notificações</p>
      </motion.div>

      <motion.div variants={item}>
        <NotificationStats stats={stats} />
      </motion.div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">🧩 Templates ({stats?.activeTemplates ?? 0})</TabsTrigger>
          <TabsTrigger value="broadcast">📢 Enviar</TabsTrigger>
          <TabsTrigger value="history">📋 Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <motion.div variants={item}>
            <NotificationTemplateManager />
          </motion.div>
        </TabsContent>

        <TabsContent value="broadcast">
          <motion.div variants={item}>
            <NotificationBroadcast />
          </motion.div>
        </TabsContent>

        <TabsContent value="history">
          <motion.div variants={item}>
            <NotificationHistory />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
