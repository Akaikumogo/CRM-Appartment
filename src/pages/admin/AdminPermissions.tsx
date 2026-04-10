import { Card, List, Typography } from 'antd';
import {
  ALL_PERMISSION_KEYS_LIST,
  PERMISSION_LABELS,
} from '@/lib/permissions';

const { Title, Text } = Typography;

/** Superadmin: read-only permission key catalog (CRM / backend bilan mos). */
export default function AdminPermissionsPage() {
  return (
    <div className="p-4">
      <Card className="border-amber-500/30 bg-[#0a0a0a]">
        <Title level={4} className="!text-white">
          Ruxsat kalitlari
        </Title>
        <Text type="secondary" className="block mb-4">
          STAFF rollari uchun modul kalitlari. Org admin Workers sahifasidan
          STAFF ga tayinlaydi.
        </Text>
        <List
          dataSource={[...ALL_PERMISSION_KEYS_LIST]}
          renderItem={(key) => (
            <List.Item className="!border-amber-500/20">
              <div>
                <div className="font-medium text-amber-100">
                  {PERMISSION_LABELS[key] ?? key}
                </div>
                <code className="text-xs text-amber-500/80">{key}</code>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
