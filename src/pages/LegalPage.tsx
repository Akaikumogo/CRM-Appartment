import { Card, Typography } from 'antd';

export default function LegalPage() {
  return (
    <div className="max-w-3xl space-y-4 p-2">
      <Typography.Title level={4}>Rasmiy ma’lumot</Typography.Title>
      <Card>
        <Typography.Paragraph>
          Ushbu tizim korporativ boshqaruv uchun mo‘ljallangan. Foydalanish
          shartlari va maxfiylik siyosati tashkilotingiz bilan kelishilgan holda
          qo‘llaniladi.
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          Qo‘shimcha hujjatlar yoki integratsiyalar keyingi versiyalarda
          qo‘shilishi mumkin.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
