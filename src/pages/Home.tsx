import { useMemo } from 'react';
import { Building2, Home, Layers3, Tag } from 'lucide-react';
import {
  Card,
  Col,
  Row,
  Spin,
  Table,
  Tag as AntTag,
  Typography,
} from 'antd';
import type { BranchOverviewRow } from '@/api/analytics';
import { useAnalyticsOverviewQuery } from '@/hooks/api/crmHooks';
import { useTranslation } from '@/hooks/useTranslation';
import { getSessionUser } from '@/lib/sessionUser';

type OverviewRow = BranchOverviewRow;

const { Text, Title } = Typography;

export default function HomePage() {
  const { t } = useTranslation();
  const user = getSessionUser();
  const live = user?.role === 'org_admin' || user?.role === 'staff';
  const { data: rows = [], isLoading: loading } = useAnalyticsOverviewQuery(
    live,
    { retry: 0 },
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => ({
          total: a.total + r.total,
          forSale: a.forSale + r.forSale,
          reserved: a.reserved + r.reserved,
          sold: a.sold + r.sold,
        }),
        { total: 0, forSale: 0, reserved: 0, sold: 0 },
      ),
    [rows],
  );

  if (!live) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-400">
        {t({
          uz: 'Boshqaruv paneli uchun tizimga kiring.',
          en: 'Sign in to open the dashboard.',
          ru: 'Войдите в систему.',
        })}
      </div>
    );
  }

  const statCards = [
    {
      key: 'total',
      label: t({
        uz: 'Jami kvartira',
        en: 'Total units',
        ru: 'Всего квартир',
      }),
      value: totals.total,
      icon: Home,
      color: '#2dd4bf',
    },
    {
      key: 'sale',
      label: t({
        uz: 'Sotuvda',
        en: 'For sale',
        ru: 'В продаже',
      }),
      value: totals.forSale,
      icon: Tag,
      color: '#10b981',
    },
    {
      key: 'res',
      label: t({
        uz: 'Bron',
        en: 'Reserved',
        ru: 'Бронь',
      }),
      value: totals.reserved,
      icon: Layers3,
      color: '#f59e0b',
    },
    {
      key: 'sold',
      label: t({
        uz: 'Sotilgan',
        en: 'Sold',
        ru: 'Продано',
      }),
      value: totals.sold,
      icon: Building2,
      color: '#6366f1',
    },
  ];

  return (
    <div className="min-h-full space-y-6 p-2">
      <div>
        <Title level={4} className="!mb-1 !text-slate-900 dark:!text-white">
          {user?.role === 'org_admin'
            ? t({
                uz: 'Barcha filiallar — qisqacha',
                en: 'All branches — overview',
                ru: 'Все филиалы — обзор',
              })
            : t({
                uz: 'Sizning filialingiz',
                en: 'Your branch',
                ru: 'Ваш филиал',
              })}
        </Title>
        <Text type="secondary">
          {t({
            uz: 'Ma’lumotlar backenddan real vaqtda hisoblanadi.',
            en: 'Counts are loaded from the API.',
            ru: 'Данные с сервера.',
          })}
        </Text>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Col xs={24} sm={12} lg={6} key={s.key}>
                <Card className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-sm text-slate-500 dark:text-slate-400">
                        {s.label}
                      </Text>
                      <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {s.value}
                      </div>
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${s.color}33` }}
                    >
                      <Icon size={22} style={{ color: s.color }} />
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Card
          className="mt-6 border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-[#101010]"
          title={
            <span className="text-slate-900 dark:text-white">
              {t({
                uz: 'Filial kesimida',
                en: 'Per branch',
                ru: 'По филиалам',
              })}
            </span>
          }
        >
          <Table<OverviewRow>
            rowKey="branchId"
            dataSource={rows}
            pagination={false}
            locale={{
              emptyText: t({
                uz: 'Hozircha filial yoki kvartira yo‘q',
                en: 'No branches or units yet',
                ru: 'Нет данных',
              }),
            }}
            columns={[
              {
                title: t({ uz: 'Filial', en: 'Branch', ru: 'Филиал' }),
                dataIndex: 'name',
                render: (name: string, r) => (
                  <span className="font-medium text-slate-900 dark:text-white">
                    {name}
                    {r.code ? (
                      <Text type="secondary" className="ml-2 text-xs">
                        ({r.code})
                      </Text>
                    ) : null}
                  </span>
                ),
              },
              {
                title: 'VIP',
                render: (_, r) =>
                  r.isVip ? (
                    <AntTag color="gold">VIP</AntTag>
                  ) : (
                    <AntTag>—</AntTag>
                  ),
              },
              {
                title: t({ uz: 'Holat', en: 'Status', ru: 'Статус' }),
                render: (_, r) =>
                  r.isBlocked ? (
                    <AntTag color="red">
                      {t({ uz: 'Blok', en: 'Blocked', ru: 'Блок' })}
                    </AntTag>
                  ) : (
                    <AntTag color="green">
                      {t({ uz: 'Faol', en: 'Active', ru: 'Активен' })}
                    </AntTag>
                  ),
              },
              { title: t({ uz: 'Sotuvda', en: 'For sale', ru: 'Продажа' }), dataIndex: 'forSale' },
              { title: t({ uz: 'Bron', en: 'Reserved', ru: 'Бронь' }), dataIndex: 'reserved' },
              { title: t({ uz: 'Sotilgan', en: 'Sold', ru: 'Продано' }), dataIndex: 'sold' },
              { title: t({ uz: 'Jami', en: 'Total', ru: 'Всего' }), dataIndex: 'total' },
            ]}
          />
        </Card>
      </Spin>
    </div>
  );
}
