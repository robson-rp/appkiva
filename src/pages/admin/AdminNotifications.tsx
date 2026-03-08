import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LanguageContext';
import NotificationStats, { useNotificationStats } from '@/components/admin/NotificationStats';
import NotificationTemplateManager from '@/components/admin/NotificationTemplateManager';
import NotificationBroadcast from '@/components/admin/NotificationBroadcast';
import NotificationHistory from '@/components/admin/NotificationHistory';
import NotificationAnalytics from '@/components/admin/NotificationAnalytics';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminNotifications() {
  const t = useT();
  const { data: stats } = useNotificationStats();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-heading md:text-heading-lg font-display font-bold text-foreground">{t('admin.notif.title')}</h1>
        <p className="text-small text-muted-foreground mt-1">{t('admin.notif.subtitle')}</p>
      </motion.div>

      <motion.div variants={item}>
        <NotificationStats stats={stats} />
      </motion.div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">{t('admin.notif.tab_templates')} ({stats?.activeTemplates ?? 0})</TabsTrigger>
          <TabsTrigger value="broadcast">{t('admin.notif.tab_broadcast')}</TabsTrigger>
          <TabsTrigger value="history">{t('admin.notif.tab_history')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('admin.notif.tab_analytics')}</TabsTrigger>
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

        <TabsContent value="analytics">
          <motion.div variants={item}>
            <NotificationAnalytics />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
