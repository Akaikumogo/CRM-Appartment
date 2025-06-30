import { Home, DollarSign, UserCheck, UserX, TrendingUp } from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Table
} from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
const { Title, Text } = Typography;

export default function HomePage() {
  const { t } = useTranslation();
  const salesStats = [
    {
      title: t({
        uz: 'Bugungi Sotuvlar',
        ru: 'Сегодняшние продажи',
        en: "Today's Sales"
      }),
      value: 3,
      amount: t({
        uz: "285,000 so'm",
        ru: '285,000 сум',
        en: '$285,000'
      }),
      icon: Home,
      color: '#6bd2bc'
    },
    {
      title: t({
        uz: 'Oylik Sotuvlar',
        ru: 'Ежемесячные продажи',
        en: 'Monthly Sales'
      }),
      value: 18,
      amount: t({
        uz: "2.1M so'm",
        ru: '2.1M сум',
        en: '$2.1M'
      }),
      icon: DollarSign,
      color: '#10b981'
    },
    {
      title: t({
        uz: 'Ishchilar',
        ru: 'Сотрудники',
        en: 'Employees'
      }),
      value: 12,
      total: 15,
      icon: UserCheck,
      color: '#3b82f6'
    },
    {
      title: t({
        uz: 'Kechikkanlar',
        ru: 'Пропущенные',
        en: 'Missed'
      }),
      value: 2,
      icon: UserX,
      color: '#ef4444'
    }
  ];

  // Recent sales
  const recentSales = [
    {
      id: 1,
      apartment: 'A-1-12',
      client: t({
        uz: 'Alisher Karimov',
        ru: 'Алишер Каримов',
        en: 'Alisher Karimov'
      }),
      seller: t({
        uz: 'Sardor Umarov',
        ru: 'Сардор Умаров',
        en: 'Sardor Umarov'
      }),
      price: 95000,
      time: t({
        uz: '10:30',
        ru: '10:30',
        en: '10:30'
      }),
      status: t({
        uz: 'Tugallangan',
        ru: 'Завершен',
        en: 'Completed'
      })
    },
    {
      id: 2,
      apartment: 'B-3-25',
      client: t({
        uz: 'Malika Tosheva',
        ru: 'Малика Тощева',
        en: 'Malika Tosheva'
      }),
      seller: t({
        uz: 'Dilshod Rahimov',
        ru: 'Дільшод Рахимов',
        en: 'Dilshod Rahimov'
      }),
      price: 120000,
      time: t({
        uz: '14:15',
        ru: '14:15',
        en: '14:15'
      }),
      status: t({
        uz: 'Tugallangan',
        ru: 'Завершен',
        en: 'Completed'
      })
    },
    {
      id: 3,
      apartment: 'C-2-18',
      client: t({
        uz: 'Bobur Nazarov',
        ru: 'Бобур Назаров',
        en: 'Bobur Nazarov'
      }),
      seller: t({
        uz: 'Aziza Karimova',
        ru: 'Азиза Каримова',
        en: 'Aziza Karimova'
      }),
      price: 85000,
      time: t({
        uz: '16:45',
        ru: '16:45',
        en: '16:45'
      }),
      status: t({
        uz: 'Oyida',
        ru: 'В ожидании',
        en: 'Pending'
      })
    }
  ];

  // Employee attendance
  const employeeAttendance = [
    {
      key: 1,
      name: t({
        uz: 'Sardor Umarov',
        ru: 'Сардор Умаров',
        en: 'Sardor Umarov'
      }),
      role: t({
        uz: 'Sotuvchi',
        ru: 'Продавец',
        en: 'Seller'
      }),
      checkIn: t({
        uz: '08:45',
        ru: '08:45',
        en: '08:45'
      }),
      checkOut: '-',
      status: t({
        uz: 'Ishda',
        ru: 'Работает',
        en: 'Present'
      }),
      sales: 2
    },
    {
      key: 2,
      name: t({
        uz: 'Dilshod Rahimov',
        ru: 'Дільшод Рахимов',
        en: 'Dilshod Rahimov'
      }),
      role: t({
        uz: 'Sotuvchi',
        ru: 'Продавец',
        en: 'Seller'
      }),
      checkIn: t({
        uz: '09:15',
        ru: '09:15',
        en: '09:15'
      }),
      checkOut: '-',
      status: t({
        uz: 'Ishda',
        ru: 'Работает',
        en: 'Present'
      }),
      sales: 1
    },
    {
      key: 3,
      name: t({
        uz: 'Aziza Karimova',
        ru: 'Азиза Каримова',
        en: 'Aziza Karimova'
      }),
      role: t({
        uz: 'Sotuvchi',
        ru: 'Продавец',
        en: 'Seller'
      }),
      checkIn: t({
        uz: '08:30',
        ru: '08:30',
        en: '08:30'
      }),
      checkOut: '-',
      status: t({
        uz: 'Ishda',
        ru: 'Работает',
        en: 'Present'
      }),
      sales: 1
    },
    {
      key: 4,
      name: t({
        uz: 'Jasur Toshev',
        ru: 'Джасур Тощев',
        en: 'Jasur Toshev'
      }),
      role: t({
        uz: 'Menejer',
        ru: 'Менеджер',
        en: 'Manager'
      }),
      checkIn: t({
        uz: '10:30',
        ru: '10:30',
        en: '10:30'
      }),
      checkOut: '-',
      status: t({
        uz: 'Kechikdi',
        ru: 'Опаздывает',
        en: 'Late'
      }),
      sales: 0
    },
    {
      key: 5,
      name: t({
        uz: 'Nigora Alieva',
        ru: 'Нигора Алиева',
        en: 'Nigora Alieva'
      }),
      role: t({
        uz: 'Sotuvchi',
        ru: 'Продавец',
        en: 'Seller'
      }),
      checkIn: '-',
      checkOut: '-',
      status: t({
        uz: 'Kelmadi',
        ru: 'Не пришел',
        en: 'Absent'
      }),
      sales: 0
    }
  ];

  const attendanceColumns = [
    {
      title: t({
        uz: 'Ism',
        ru: 'Имя',
        en: 'Name'
      }),
      dataIndex: 'name',
      key: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          {' '}
          <Avatar size="small" style={{ backgroundColor: '#6bd2bc' }}>
            {text
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {text}
            </div>
            <div className="text-xs text-slate-500">{record.role}</div>
          </div>
        </div>
      )
    },
    {
      title: t({
        uz: 'Kelish',
        ru: 'Время начала',
        en: 'Check-in'
      }),
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (time: string) => (
        <Text
          className={
            time === '-' ? 'text-slate-400' : 'text-slate-900 dark:text-white'
          }
        >
          {time || '-'}
        </Text>
      )
    },
    {
      title: t({
        uz: 'Ketish',
        ru: 'Время конца',
        en: 'Check-out'
      }),
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time: string) => <Text className="text-slate-400">{time}</Text>
    },
    {
      title: t({
        uz: 'Holat',
        ru: 'Статус',
        en: 'Status'
      }),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          color={
            status ===
            t({
              uz: 'Ishda',
              ru: 'Работает',
              en: 'Present'
            })
              ? 'green'
              : status ===
                t({
                  uz: 'Kechikdi',
                  ru: 'Опаздывает',
                  en: 'Late'
                })
              ? 'orange'
              : 'red'
          }
          text={status}
          className="text-xs"
        />
      )
    },
    {
      title: t({
        uz: 'Sotuvlar',
        ru: 'Продажи',
        en: 'Sales'
      }),
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => (
        <Text className="text-slate-900 dark:text-white font-medium">
          {sales}{' '}
          {t({
            uz: 'ta',
            ru: 'шт.',
            en: 'items'
          })}
          {sales > 0 ? (
            <span className="text-green-600 dark:text-green-400">
              {' '}
              <TrendingUp size={14} className="inline" />{' '}
            </span>
          ) : null}
        </Text>
      )
    }
  ];
  return (
    <div className="p-2 space-y-6 min-h-full">
      {/* Stats Cards */}
      <div>
        <Row gutter={[24, 24]}>
          {salesStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <div key={index + 'wtf1Key'}>
                  <Card className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text className="text-slate-600 dark:text-slate-400 text-sm">
                          {stat.title}
                        </Text>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                          {stat.value}
                          {stat.total && (
                            <span className="text-slate-400">
                              /{stat.total}
                            </span>
                          )}
                        </div>
                        {/* {stat.amount && (
                          <Text className="text-green-600 dark:text-green-400 text-sm font-medium">
                            {stat.amount}
                          </Text>
                        )} */}
                      </div>
                      <Avatar
                        size={48}
                        style={{ backgroundColor: stat.color }}
                        icon={<Icon size={24} />}
                      />
                    </div>
                  </Card>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Recent Sales */}
        <Col xs={24} lg={24}>
          <div>
            <Card
              className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
              title={
                <Title
                  level={4}
                  className="!text-slate-900 dark:!text-white !mb-0"
                >
                  Bugungi Sotuvlar
                </Title>
              }
              extra={
                <Button
                  type="link"
                  style={{ color: '#6bd2bc' }}
                  className="p-0"
                >
                  Barchasini ko'rish
                </Button>
              }
            >
              <Space direction="vertical" size="middle" className="w-full">
                {recentSales.map((sale, index) => (
                  <div
                    key={sale.id + index}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#000000]/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        style={{ backgroundColor: '#6bd2bc' }}
                        icon={<Home size={16} />}
                      />
                      <div>
                        <Title
                          level={5}
                          className="!text-slate-900 dark:!text-white !mb-0"
                        >
                          {sale.apartment}
                        </Title>
                        <Text className="text-slate-600 dark:text-slate-400 text-sm">
                          {sale.client} • {sale.seller}
                        </Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        ${sale.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Text className="text-slate-500 text-xs">
                          {sale.time}
                        </Text>
                        <Badge
                          color={
                            sale.status === 'completed' ? 'green' : 'orange'
                          }
                          text={
                            sale.status === 'completed'
                              ? 'Tugallandi'
                              : 'Kutilmoqda'
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Employee Attendance Table */}
      <div>
        <Card
          className="bg-white/90 dark:bg-[#101010] border-slate-200 dark:border-slate-800"
          title={
            <Title level={4} className="!text-slate-900 dark:!text-white !mb-0">
              Ishchilar Davomligi
            </Title>
          }
          extra={
            <Button type="link" style={{ color: '#6bd2bc' }} className="p-0">
              Batafsil
            </Button>
          }
        >
          <Table
            columns={attendanceColumns}
            dataSource={employeeAttendance}
            pagination={false}
            size="middle"
            className="custom-table"
          />
        </Card>
      </div>
    </div>
  );
}
