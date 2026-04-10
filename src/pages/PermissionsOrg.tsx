import { useEffect, useMemo, useState } from 'react';
import { Card, Select, Button, message, Checkbox, Space, Typography } from 'antd';
import { useUserMutations, useUsersQuery } from '@/hooks/api/crmHooks';
import {
  ALL_PERMISSION_KEYS_LIST,
  PERMISSION_LABELS,
} from '@/lib/permissions';
import { getSessionUser } from '@/lib/sessionUser';

const { Title, Text } = Typography;

type UserRow = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  permissions: string[] | null;
};

export default function PermissionsOrgPage() {
  const orgUser = getSessionUser();
  const enabled = orgUser?.role === 'org_admin';
  const { data: allUsers = [], isLoading: loading } = useUsersQuery(enabled);
  const users = useMemo(
    () =>
      allUsers.filter((u) => u.role === 'staff') as UserRow[],
    [allUsers],
  );

  const [sel, setSel] = useState<string | null>(null);
  const [selPerms, setSelPerms] = useState<string[]>([]);
  const { patchPermissions } = useUserMutations();

  useEffect(() => {
    const u = users.find((x) => x.id === sel);
    if (!u) {
      setSelPerms([]);
      return;
    }
    setSelPerms(
      u.permissions === null || u.permissions === undefined
        ? [...ALL_PERMISSION_KEYS_LIST]
        : [...u.permissions],
    );
  }, [sel, users]);

  const save = async () => {
    if (!sel) {
      return;
    }
    try {
      await patchPermissions.mutateAsync({
        id: sel,
        permissions: selPerms,
      });
      message.success('Saqlandi');
    } catch {
      message.error('Saqlashda xato');
    }
  };

  if (orgUser?.role !== 'org_admin') {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        Faqat tashkilot admini uchun.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="border-zinc-800 bg-zinc-950/50 dark:border-zinc-800">
        <Title level={4} className="!text-white">
          STAFF ruxsatlari
        </Title>
        <Text type="secondary" className="block mb-4">
          Filial xodimini tanlang va modul ruxsatlarini belgilang.
        </Text>
        <Space direction="vertical" className="w-full" size="large">
          <Select
            className="!min-w-[280px]"
            placeholder="Foydalanuvchi"
            loading={loading}
            value={sel}
            onChange={setSel}
            options={users.map((u) => ({
              value: u.id,
              label: `${u.fullName || u.email} (${u.email})`,
            }))}
          />
          {sel ? (
            <>
              <Checkbox.Group
                className="flex flex-col gap-2"
                value={selPerms}
                onChange={(v) => setSelPerms(v as string[])}
                options={ALL_PERMISSION_KEYS_LIST.map((k) => ({
                  label: `${PERMISSION_LABELS[k] ?? k} (${k})`,
                  value: k,
                }))}
              />
              <Button
                type="primary"
                className="!bg-teal-500 !border-teal-500"
                loading={patchPermissions.isPending}
                onClick={() => void save()}
              >
                Saqlash
              </Button>
            </>
          ) : null}
        </Space>
      </Card>
    </div>
  );
}
