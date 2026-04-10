import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  useBranchOrgMutations,
  useBranchesOrgQuery,
} from '@/hooks/api/crmHooks';
import { getSessionUser } from '@/lib/sessionUser';

type BranchRow = {
  id: string;
  name: string;
  code: string | null;
  isBlocked: boolean;
  isVip: boolean;
  blockedReason: string | null;
};

export default function BranchesMgmt() {
  const user = getSessionUser();
  const orgId = user?.organizationId ?? undefined;
  const [edit, setEdit] = useState<BranchRow | null>(null);
  const [form] = Form.useForm();

  const { data: rows = [], isLoading: loading } = useBranchesOrgQuery(
    orgId,
    Boolean(user?.role === 'org_admin' && orgId),
  );
  const { patch } = useBranchOrgMutations(orgId);

  const tableRows = useMemo(() => rows as BranchRow[], [rows]);

  if (user?.role !== 'org_admin' || !orgId) {
    return (
      <div className="p-6 text-amber-600">
        Bu sahifa faqat tashkilot admini uchun.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <Typography.Title level={4}>Filiallar</Typography.Title>
      <Typography.Paragraph type="secondary">
        Har bir filial uchun <strong>filial admini</strong> (asosiy kirish)
        akkauntini «Ishchilar» bo‘limidan qo‘shishingiz yoki filial
        yaratishda superadmin/tashkilot admini birinchi login/parol bilan
        yaratishi mumkin.
      </Typography.Paragraph>
      <Card>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={tableRows}
          pagination={false}
          columns={[
            { title: 'Nomi', dataIndex: 'name' },
            { title: 'Kod', dataIndex: 'code', render: (v) => v || '—' },
            {
              title: 'VIP',
              render: (_, r) =>
                r.isVip ? <Tag color="gold">VIP</Tag> : <Tag>—</Tag>,
            },
            {
              title: 'Holat',
              render: (_, r) =>
                r.isBlocked ? (
                  <Tag color="red">Blok</Tag>
                ) : (
                  <Tag color="green">Faol</Tag>
                ),
            },
            {
              title: '',
              render: (_, r) => (
                <Button type="link" onClick={() => setEdit(r)}>
                  Sozlamalar
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={edit?.name}
        open={!!edit}
        onCancel={() => {
          setEdit(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        afterOpenChange={(o) => {
          if (o && edit) {
            form.setFieldsValue({
              isVip: edit.isVip,
              isBlocked: edit.isBlocked,
              blockedReason: edit.blockedReason ?? '',
            });
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (v: {
            isVip: boolean;
            isBlocked: boolean;
            blockedReason?: string;
          }) => {
            if (!edit) {
              return;
            }
            try {
              await patch.mutateAsync({
                id: edit.id,
                body: {
                  isVip: v.isVip,
                  isBlocked: v.isBlocked,
                  blockedReason: v.blockedReason || undefined,
                },
              });
              message.success('Saqlandi');
              setEdit(null);
            } catch {
              message.error('Xatolik');
            }
          }}
        >
          <Form.Item name="isVip" label="VIP" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isBlocked" label="Bloklangan" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="blockedReason" label="Blok sababi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={patch.isPending}
          >
            Saqlash
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
