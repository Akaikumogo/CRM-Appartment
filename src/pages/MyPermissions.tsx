import { useMemo } from 'react';
import { Card, List, Typography } from 'antd';
import {
  ALL_PERMISSION_KEYS_LIST,
  PERMISSION_LABELS,
} from '@/lib/permissions';
import { getSessionUser } from '@/lib/sessionUser';

const { Title, Text } = Typography;

export default function MyPermissionsPage() {
  const user = getSessionUser();
  const effective = user?.effectivePermissions ?? [];

  const rows = useMemo(
    () =>
      ALL_PERMISSION_KEYS_LIST.map((key) => ({
        key,
        label: PERMISSION_LABELS[key] ?? key,
        on: effective.includes(key),
      })),
    [effective],
  );

  if (user?.role !== 'staff') {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        Bu sahifa faqat filial (STAFF) foydalanuvchilari uchun.
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="border-zinc-800 bg-zinc-950/50 dark:border-zinc-800">
        <Title level={4} className="!text-white">
          Mening ruxsatlarim
        </Title>
        <Text type="secondary" className="block mb-4">
          Tashkilot admini bergan modul ruxsatlari. O‘zgartirish uchun
          rahbarga murojaat qiling.
        </Text>
        <List
          dataSource={rows}
          renderItem={(item) => (
            <List.Item>
              <span className={item.on ? 'text-teal-400' : 'text-zinc-500'}>
                {item.on ? '✓' : '○'} {item.label}{' '}
                <code className="text-xs text-zinc-600">({item.key})</code>
              </span>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
