import { useState, useEffect, useRef } from 'react';

import {
  ArrowLeft,
  Printer,
  Download,
  Eye,
  User,
  Phone,
  Home
} from 'lucide-react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Badge,
  Space,
  Divider,
  Avatar,
  Statistic,
  Descriptions,
  message
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Contract detail type
export type ContractDetailDto = {
  contractId: string;
  orderNumber: number;
  clientName: string;
  clientPhone: string;
  apartmentNumber: string;
  blockName: string;
  floorNumber: number;
  sellerName: string;
  contractAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  progress: number;
  contractDate: string;
  createdAt: string;
  updatedAt: string;
  completedTime?: string;
  discountPercentage: number;
  extraFeePercentage: number;
  prepayment: number;
  debt: number;
  totalPriceAfterDiscount: number;
  goods: ContractGoodDto[];
  companyInfo: {
    name: string;
    address: string;
    phones: string[];
    telegram: string;
    instagram: string;
  };
};

export type ContractGoodDto = {
  id: string;
  name: string;
  comment?: string;
  quantity: number;
  measurement: string;
  price: number;
  totalPrice: number;
};

// Mock data generator
const generateMockContractDetail = (contractId: string): ContractDetailDto => ({
  contractId,
  orderNumber: 12345,
  clientName: 'Alisher Karimov',
  clientPhone: '+998901234567',
  apartmentNumber: 'A-1-12',
  blockName: 'A Blok',
  floorNumber: 1,
  sellerName: 'Sardor Umarov',
  contractAmount: 95000,
  status: 'active',
  paymentStatus: 'partial',
  progress: 65,
  contractDate: '2024-01-15',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  completedTime: '2024-02-15T18:00:00Z',
  discountPercentage: 5,
  extraFeePercentage: 0,
  prepayment: 30000,
  debt: 35000,
  totalPriceAfterDiscount: 90250,
  goods: [
    {
      id: '1',
      name: 'Tozalash xizmati',
      comment: 'Umumiy tozalash',
      quantity: 1,
      measurement: 'xona',
      price: 50000,
      totalPrice: 50000
    },
    {
      id: '2',
      name: 'Oyna tozalash',
      comment: 'Barcha oynalar',
      quantity: 8,
      measurement: 'dona',
      price: 5000,
      totalPrice: 40000
    },
    {
      id: '3',
      name: 'Pol yuvish',
      comment: 'Laminat va plitka',
      quantity: 1,
      measurement: 'xona',
      price: 5000,
      totalPrice: 5000
    }
  ],
  companyInfo: {
    name: 'TANZIF CLEANING',
    address: 'Toshkent shahar, Yunusobod tumani',
    phones: ['+998 93 570 51 50', '+998 93 570 59 92'],
    telegram: '@tanzif_admin',
    instagram: 'tanzif_cleaning'
  }
});

export default function ContractDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const contractId = params?.contractId as string;
  const [contractData, setContractData] = useState<ContractDetailDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockContractDetail(contractId);
      setContractData(mockData);
      setLoading(false);
    }, 1000);
  }, [contractId]);

  const handlePrint = useReactToPrint({
    contentRef
  });

  const handleDownload = () => {
    message.success('Shartnoma yuklab olindi!');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: '#10b981',
      completed: '#6bd2bc',
      pending: '#f59e0b',
      cancelled: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPaymentColor = (status: string) => {
    const colors = {
      paid: '#10b981',
      partial: '#f59e0b',
      unpaid: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="p-2 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6bd2bc] mx-auto mb-4"></div>
          <Text className="text-slate-600 dark:text-slate-400">
            Shartnoma yuklanmoqda...
          </Text>
        </div>
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="p-2 min-h-full flex items-center justify-center">
        <Text className="text-slate-600 dark:text-slate-400">
          Shartnoma topilmadi
        </Text>
      </div>
    );
  }

  const goodsColumns = [
    {
      title: 'Xizmat nomi',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ContractGoodDto) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {name}
          </div>
          {record.comment && (
            <div className="text-sm text-slate-500">{record.comment}</div>
          )}
        </div>
      )
    },
    {
      title: 'Miqdor',
      key: 'quantity',
      render: (record: ContractGoodDto) => (
        <Text className="text-slate-900 dark:text-white">
          {record.quantity} {record.measurement}
        </Text>
      )
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text className="font-semibold text-green-600">
          {price.toLocaleString()} UZS
        </Text>
      )
    },
    {
      title: 'Jami',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total: number) => (
        <Text className="font-semibold text-slate-900 dark:text-white">
          {total.toLocaleString()} UZS
        </Text>
      )
    }
  ];

  return (
    <div className="p-2 space-y-6 min-h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate('/dashboard/contracts')}
              size="large"
            >
              Orqaga
            </Button>
            <div>
              <Title
                level={2}
                className="!text-slate-900 dark:!text-white !mb-1"
              >
                Shartnoma #{contractData.orderNumber}
              </Title>
              <Text className="text-slate-600 dark:text-slate-400">
                {dayjs(contractData.contractDate).format('DD MMMM YYYY')}
              </Text>
            </div>
          </div>
          <Space>
            <Button icon={<Eye size={18} />} size="large">
              Ko'rish
            </Button>
            <Button
              icon={<Download size={18} />}
              size="large"
              onClick={handleDownload}
              style={{ color: '#6bd2bc', borderColor: '#6bd2bc' }}
            >
              Yuklab olish
            </Button>
            <Button
              type="primary"
              icon={<Printer size={18} />}
              size="large"
              onClick={handlePrint}
              style={{ background: '#6bd2bc', border: 'none' }}
            >
              Chop etish
            </Button>
          </Space>
        </div>
      </div>

      {/* Status Cards */}
      <div>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-[#6fe0c8] to-[#419380da] border-0 text-white">
              <Statistic
                title={<span className="text-white/80">Shartnoma summasi</span>}
                value={contractData.contractAmount}
                prefix="$"
                valueStyle={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-green-400 to-green-600 border-0 text-white">
              <Statistic
                title={<span className="text-white/80">To'langan</span>}
                value={contractData.prepayment}
                valueStyle={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
                formatter={(value) => `${Number(value).toLocaleString()} UZS`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-orange-400 to-orange-600 border-0 text-white">
              <Statistic
                title={<span className="text-white/80">Qarz</span>}
                value={contractData.debt}
                valueStyle={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
                formatter={(value) => `${Number(value).toLocaleString()} UZS`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-0 text-white">
              <Statistic
                title={<span className="text-white/80">Progress</span>}
                value={contractData.progress}
                suffix="%"
                valueStyle={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Contract Info */}
        <Col xs={24} lg={16}>
          <div>
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Shartnoma Ma'lumotlari
                </Title>
              }
            >
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Shartnoma ID">
                  {contractData.contractId}
                </Descriptions.Item>
                <Descriptions.Item label="Buyurtma raqami">
                  #{contractData.orderNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Holat">
                  <Tag
                    color={getStatusColor(contractData.status)}
                    style={{ color: 'white', border: 'none' }}
                  >
                    {contractData.status === 'active'
                      ? 'Faol'
                      : contractData.status === 'completed'
                      ? 'Tugallangan'
                      : contractData.status === 'pending'
                      ? 'Kutilmoqda'
                      : 'Bekor qilingan'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="To'lov holati">
                  <Badge
                    color={getPaymentColor(contractData.paymentStatus)}
                    text={
                      contractData.paymentStatus === 'paid'
                        ? "To'langan"
                        : contractData.paymentStatus === 'partial'
                        ? 'Qisman'
                        : "To'lanmagan"
                    }
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Shartnoma sanasi">
                  {dayjs(contractData.contractDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Tugallanish sanasi">
                  {contractData.completedTime
                    ? dayjs(contractData.completedTime).format(
                        'DD.MM.YYYY HH:mm'
                      )
                    : 'Belgilanmagan'}
                </Descriptions.Item>
                <Descriptions.Item label="Chegirma">
                  {contractData.discountPercentage}%
                </Descriptions.Item>
                <Descriptions.Item label="Qo'shimcha to'lov">
                  {contractData.extraFeePercentage}%
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Goods Table */}
          <div className="mt-6">
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Xizmatlar Ro'yxati
                </Title>
              }
            >
              <Table
                columns={goodsColumns}
                dataSource={contractData.goods}
                rowKey="id"
                pagination={false}
                size="middle"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>Jami:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong className="text-green-600">
                          {contractData.goods
                            .reduce((sum, item) => sum + item.totalPrice, 0)
                            .toLocaleString()}{' '}
                          UZS
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          </div>
        </Col>

        {/* Client & Seller Info */}
        <Col xs={24} lg={8}>
          <div>
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Mijoz Ma'lumotlari
                </Title>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar size={48} style={{ backgroundColor: '#6bd2bc' }}>
                    {contractData.clientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Avatar>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {contractData.clientName}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone size={14} />
                      {contractData.clientPhone}
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <Text strong className="text-slate-600">
                    Kvartira:
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <Home size={16} className="text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {contractData.apartmentNumber}
                      </div>
                      <div className="text-sm text-slate-500">
                        {contractData.blockName}, {contractData.floorNumber}
                        -qavat
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <Text strong className="text-slate-600">
                    Sotuvchi:
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-slate-400" />
                    <div className="font-medium text-slate-900 dark:text-white">
                      {contractData.sellerName}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="mt-6">
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  To'lov Ma'lumotlari
                </Title>
              }
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text>Asosiy summa:</Text>
                  <Text className="font-medium">
                    {contractData.contractAmount.toLocaleString()} UZS
                  </Text>
                </div>
                {contractData.discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <Text>Chegirma ({contractData.discountPercentage}%):</Text>
                    <Text className="font-medium">
                      -
                      {(
                        (contractData.contractAmount *
                          contractData.discountPercentage) /
                        100
                      ).toLocaleString()}{' '}
                      UZS
                    </Text>
                  </div>
                )}
                <Divider />
                <div className="flex justify-between">
                  <Text strong>Jami summa:</Text>
                  <Text strong className="text-lg">
                    {contractData.totalPriceAfterDiscount.toLocaleString()} UZS
                  </Text>
                </div>
                <div className="flex justify-between text-green-600">
                  <Text>To'langan:</Text>
                  <Text className="font-medium">
                    {contractData.prepayment.toLocaleString()} UZS
                  </Text>
                </div>
                <div className="flex justify-between text-orange-600">
                  <Text>Qarz:</Text>
                  <Text className="font-medium">
                    {contractData.debt.toLocaleString()} UZS
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Print Version (Hidden) */}
      <div style={{ display: 'none' }}>
        <div ref={contentRef} className="print-container">
          <div
            className="w-full bg-white text-black p-8"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: '12px',
              lineHeight: '1.4'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-xl font-bold mb-2">
                KVARTIRA SOTIB OLISH SHARTNOMASI
              </h1>
              <p className="text-lg font-semibold">
                № {contractData.orderNumber}
              </p>
              <p className="mt-2">
                {dayjs(contractData.contractDate).format('DD.MM.YYYY')} yil
              </p>
              <p className="mt-1">Toshkent shahri</p>
            </div>

            {/* Contract Parties */}
            <div className="mb-6">
              <p className="text-justify mb-4">
                Bir tomondan <strong>"{contractData.companyInfo.name}"</strong>{' '}
                MChJ (bundan keyin "Sotuvchi" deb yuritiladi), ikkinchi tomondan{' '}
                <strong>{contractData.clientName}</strong> (bundan keyin
                "Xaridor" deb yuritiladi) o'rtasida quyidagi shartlar asosida
                ushbu shartnoma tuzildi:
              </p>
            </div>

            {/* Article 1 - Subject */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">
                1-MODDA. SHARTNOMA PREDMETI
              </h3>
              <p className="text-justify mb-3">
                1.1. Sotuvchi o'zini Xaridorga quyidagi ko'chmas mulkni sotishga
                majbur qiladi:
              </p>
              <div className="ml-6 mb-3">
                <p>
                  <strong>Kvartira raqami:</strong>{' '}
                  {contractData.apartmentNumber}
                </p>
                <p>
                  <strong>Joylashuv:</strong> {contractData.blockName},{' '}
                  {contractData.floorNumber}-qavat
                </p>
                <p>
                  <strong>Manzil:</strong> Toshkent shahar, Yunusobod tumani,
                  "Yangi Toshkent" turar joy majmuasi
                </p>
                <p>
                  <strong>Umumiy maydoni:</strong> 65.5 kv.m
                </p>
                <p>
                  <strong>Yashash maydoni:</strong> 45.2 kv.m
                </p>
                <p>
                  <strong>Xonalar soni:</strong> 2 (ikki)
                </p>
              </div>
              <p className="text-justify">
                1.2. Yuqorida ko'rsatilgan kvartira (bundan keyin "Mulk" deb
                yuritiladi) barcha zarur hujjatlarga ega va sotishga tayyor
                holatda.
              </p>
            </div>

            {/* Article 2 - Price */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">
                2-MODDA. NARX VA TO'LOV TARTIBI
              </h3>
              <p className="text-justify mb-2">
                2.1. Mulkning umumiy narxi{' '}
                <strong>
                  {contractData.contractAmount.toLocaleString()} (
                  {contractData.contractAmount === 95000
                    ? "to'qson besh ming"
                    : contractData.contractAmount === 120000
                    ? 'bir yuz yigirma ming'
                    : contractData.contractAmount === 85000
                    ? 'sakson besh ming'
                    : ''}
                  ) AQSH dollari
                </strong>{' '}
                ni tashkil etadi.
              </p>

              {contractData.discountPercentage > 0 && (
                <p className="text-justify mb-2">
                  2.2. Sotuvchi tomonidan {contractData.discountPercentage}%
                  miqdorida chegirma berilgan bo'lib, yakuniy narx{' '}
                  <strong>
                    {contractData.totalPriceAfterDiscount.toLocaleString()} AQSH
                    dollari
                  </strong>
                  ni tashkil etadi.
                </p>
              )}

              <p className="text-justify mb-2">
                2.3. Xaridor tomonidan oldindan to'lov sifatida{' '}
                <strong>
                  {contractData.prepayment.toLocaleString()} AQSH dollari
                </strong>
                to'langan.
              </p>

              <p className="text-justify mb-2">
                2.4. Qolgan summa{' '}
                <strong>
                  {contractData.debt.toLocaleString()} AQSH dollari
                </strong>
                mulkni topshirish paytida to'lanadi.
              </p>

              <p className="text-justify">
                2.5. To'lov naqd pul yoki bank o'tkazmasi orqali amalga
                oshiriladi.
              </p>
            </div>

            {/* Article 3 - Rights and Obligations */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">
                3-MODDA. TOMONLARNING HUQUQ VA MAJBURIYATLARI
              </h3>

              <p className="font-semibold mb-2">
                3.1. Sotuvchining majburiyatlari:
              </p>
              <div className="ml-6 mb-3">
                <p>a) Mulkni shartnomada belgilangan muddatda topshirish;</p>
                <p>b) Mulkka tegishli barcha hujjatlarni taqdim etish;</p>
                <p>c) Mulkda yashirin nuqsonlar yo'qligini kafolatlash;</p>
                <p>
                  d) Mulkni hech kimga garov qo'yilmagan va da'vo qilinmagan
                  holatda topshirish.
                </p>
              </div>

              <p className="font-semibold mb-2">
                3.2. Xaridorning majburiyatlari:
              </p>
              <div className="ml-6 mb-3">
                <p>
                  a) Shartnomada belgilangan muddatda to'lovni amalga oshirish;
                </p>
                <p>b) Mulkni qabul qilish va tegishli hujjatlarni imzolash;</p>
                <p>c) Mulk ustidan mulkchilik huquqini ro'yxatdan o'tkazish.</p>
              </div>
            </div>

            {/* Article 4 - Handover */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">
                4-MODDA. MULKNI TOPSHIRISH
              </h3>
              <p className="text-justify mb-2">
                4.1. Mulk{' '}
                {contractData.completedTime
                  ? dayjs(contractData.completedTime).format('DD.MM.YYYY')
                  : '______'}
                yilgacha topshiriladi.
              </p>
              <p className="text-justify mb-2">
                4.2. Mulk topshirilganda qabul-topshirish dalolatnomasi
                tuziladi.
              </p>
              <p className="text-justify">
                4.3. Mulk kalitlari va barcha hujjatlar qabul-topshirish paytida
                beriladi.
              </p>
            </div>

            {/* Article 5 - Warranty */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">5-MODDA. KAFOLAT</h3>
              <p className="text-justify mb-2">
                5.1. Sotuvchi qurilish ishlarining sifati uchun 2 (ikki) yil
                kafolat beradi.
              </p>
              <p className="text-justify">
                5.2. Kafolat muddati mulkni topshirish sanasidan boshlanadi.
              </p>
            </div>

            {/* Article 6 - Force Majeure */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">
                6-MODDA. FORS-MAJOR HOLATLARI
              </h3>
              <p className="text-justify">
                6.1. Tomonlar tabiiy ofatlar, urush, epidemiya va boshqa
                fors-major holatlari tufayli majburiyatlarini bajara olmaganlik
                uchun javobgar bo'lmaydi.
              </p>
            </div>

            {/* Article 7 - Dispute Resolution */}
            <div className="mb-6">
              <h3 className="text-center font-bold mb-3">
                7-MODDA. NIZOLARNI HAL ETISH
              </h3>
              <p className="text-justify">
                7.1. Shartnoma bo'yicha barcha nizolar muzokaralar yo'li bilan
                hal etiladi. Kelishuvga erishilmagan taqdirda nizolar sudda
                ko'riladi.
              </p>
            </div>

            {/* Article 8 - Final Provisions */}
            <div className="mb-8">
              <h3 className="text-center font-bold mb-3">
                8-MODDA. YAKUNIY QOIDALAR
              </h3>
              <p className="text-justify mb-2">
                8.1. Ushbu shartnoma ikki nusxada tuzildi va har bir tomon uchun
                bir nusxadan berildi.
              </p>
              <p className="text-justify mb-2">
                8.2. Shartnoma imzolanganidan boshlab kuchga kiradi.
              </p>
              <p className="text-justify">
                8.3. Shartnomaga o'zgartirishlar faqat tomonlarning yozma
                kelishuvi bilan kiritiladi.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-center font-bold mb-4">
                TOMONLARNING REKVIZITLARI
              </h3>

              <div className="grid grid-cols-2 gap-8">
                {/* Seller */}
                <div>
                  <p className="font-bold text-center mb-3">SOTUVCHI:</p>
                  <p className="font-semibold">
                    {contractData.companyInfo.name} MChJ
                  </p>
                  <p>Manzil: {contractData.companyInfo.address}</p>
                  <p>Tel: {contractData.companyInfo.phones.join(', ')}</p>
                  <p>Mas'ul shaxs: {contractData.sellerName}</p>
                  <p>Bank rekvizitlari:</p>
                  <p>H/r: 20208000600000000001</p>
                  <p>"Xalq banki" ATB Yunusobod filiali</p>
                  <p>MFO: 00014</p>
                  <p>STIR: 123456789</p>
                </div>

                {/* Buyer */}
                <div>
                  <p className="font-bold text-center mb-3">XARIDOR:</p>
                  <p className="font-semibold">{contractData.clientName}</p>
                  <p>Telefon: {contractData.clientPhone}</p>
                  <p>Passport: ____________</p>
                  <p>Berilgan sana: ____________</p>
                  <p>Kim tomonidan: ____________</p>
                  <p>Yashash manzili: ____________</p>
                  <p>____________</p>
                  <p>____________</p>
                  <p>____________</p>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12">
              <div className="grid grid-cols-2 gap-12">
                {/* Seller Signature */}
                <div className="text-center">
                  <p className="font-bold mb-8">SOTUVCHI:</p>
                  <p className="mb-2">{contractData.companyInfo.name} MChJ</p>
                  <p className="mb-8">Direktor: {contractData.sellerName}</p>
                  <div className="border-b-2 border-black w-48 mx-auto mb-2"></div>
                  <p className="text-sm">(imzo)</p>
                  <p className="mt-4">M.O.</p>
                  <p className="mt-4">Sana: {dayjs().format('DD.MM.YYYY')}</p>
                </div>

                {/* Buyer Signature */}
                <div className="text-center">
                  <p className="font-bold mb-8">XARIDOR:</p>
                  <p className="mb-8">{contractData.clientName}</p>
                  <div className="mt-12 border-b-2 border-black w-48 mx-auto mb-2"></div>
                  <p className="text-sm">(imzo)</p>
                  <p className="mt-8">Sana: {dayjs().format('DD.MM.YYYY')}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-black text-center text-xs">
              <p>
                Ushbu shartnoma O'zbekiston Respublikasi qonunchiligiga muvofiq
                tuzilgan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
