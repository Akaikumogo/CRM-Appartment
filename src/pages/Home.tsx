import { useMemo } from 'react';
import {
  Building2,
  Home,
  Layers3,
  Tag,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  Col,
  Progress,
  Row,
  Spin,
  Table,
  Tag as AntTag,
  Typography
} from 'antd';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import type { BranchOverviewRow } from '@/api/analytics';
import { useAnalyticsOverviewQuery } from '@/hooks/api/crmHooks';
import { useTranslation } from '@/hooks/useTranslation';
import { getSessionUser } from '@/lib/sessionUser';

type OverviewRow = BranchOverviewRow;

const { Text, Title } = Typography;

const PIE_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#e11d48'];

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
  trend
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p
            className="mt-2 text-4xl font-black tracking-tight"
            style={{ color }}
          >
            {value.toLocaleString()}
          </p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner"
          style={{ background: `${color}22` }}
        >
          <Icon size={26} style={{ color }} />
        </div>
      </div>
      {trend && (
        <div
          className="mt-3 flex items-center gap-1 text-xs font-semibold"
          style={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}
        >
          {trend === 'up' ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          <span>{trend === 'up' ? "O'sish" : 'Kamayish'} kuzatilmoqda</span>
        </div>
      )}
      {/* Decorative circle */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
        style={{ background: color }}
      />
    </div>
  );
}

function SoldRatioBar({
  label,
  sold,
  total,
  color
}: {
  label: string;
  sold: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
          {label}
        </span>
        <span style={{ color }} className="font-bold">
          {pct}%
        </span>
      </div>
      <Progress
        percent={pct}
        strokeColor={color}
        trailColor="#e2e8f0"
        showInfo={false}
        size="small"
      />
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const user = getSessionUser();
  const live = user?.role === 'org_admin' || user?.role === 'staff';
  const { data: rows = [], isLoading: loading } = useAnalyticsOverviewQuery(
    live,
    { retry: 0 }
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => ({
          total: a.total + r.total,
          forSale: a.forSale + r.forSale,
          reserved: a.reserved + r.reserved,
          sold: a.sold + r.sold
        }),
        { total: 0, forSale: 0, reserved: 0, sold: 0 }
      ),
    [rows]
  );

  const pieData = useMemo(
    () =>
      [
        {
          name: t({ uz: 'Sotuvda', en: 'For sale', ru: 'В продаже' }),
          value: totals.forSale
        },
        {
          name: t({ uz: 'Bron', en: 'Reserved', ru: 'Бронь' }),
          value: totals.reserved
        },
        {
          name: t({ uz: 'Sotilgan', en: 'Sold', ru: 'Продано' }),
          value: totals.sold
        }
      ].filter((d) => d.value > 0),
    [totals, t]
  );

  const barData = useMemo(
    () =>
      rows.map((r) => ({
        name: r.name.length > 12 ? r.name.slice(0, 11) + '…' : r.name,
        Sotuvda: r.forSale,
        Bron: r.reserved,
        Sotilgan: r.sold
      })),
    [rows]
  );

  if (!live) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <Activity size={48} className="text-teal-400 opacity-60" />
        <p className="text-slate-500 dark:text-slate-400">
          {t({
            uz: 'Boshqaruv paneli uchun tizimga kiring.',
            en: 'Sign in to open the dashboard.',
            ru: 'Войдите в систему.'
          })}
        </p>
      </div>
    );
  }

  const soldPct =
    totals.total > 0 ? Math.round((totals.sold / totals.total) * 100) : 0;

  const statCards = [
    {
      key: 'total',
      label: t({ uz: 'Jami kvartira', en: 'Total units', ru: 'Всего квартир' }),
      value: totals.total,
      icon: Home,
      color: '#2dd4bf',
      sub: `${rows.length} ${t({ uz: 'ta filial', en: 'branches', ru: 'филиалов' })}`,
      trend: null as 'up' | 'down' | null
    },
    {
      key: 'sale',
      label: t({ uz: 'Sotuvda', en: 'For sale', ru: 'В продаже' }),
      value: totals.forSale,
      icon: Tag,
      color: '#10b981',
      sub:
        totals.total > 0
          ? `${Math.round((totals.forSale / totals.total) * 100)}% umumiydan`
          : '',
      trend: 'up' as 'up' | 'down' | null
    },
    {
      key: 'res',
      label: t({ uz: 'Bron qilingan', en: 'Reserved', ru: 'Бронь' }),
      value: totals.reserved,
      icon: Layers3,
      color: '#f59e0b',
      sub:
        totals.total > 0
          ? `${Math.round((totals.reserved / totals.total) * 100)}% umumiydan`
          : '',
      trend: null as 'up' | 'down' | null
    },
    {
      key: 'sold',
      label: t({ uz: 'Sotilgan', en: 'Sold', ru: 'Продано' }),
      value: totals.sold,
      icon: Building2,
      color: '#6366f1',
      sub: `${soldPct}% muvaffaqiyat`,
      trend: soldPct > 50 ? ('up' as const) : null
    }
  ];

  return (
    <div className="min-h-full space-y-6 overflow-y-auto p-2 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={4} className="!mb-0.5 !text-slate-900 dark:!text-white">
            {user?.role === 'org_admin'
              ? t({
                  uz: 'Barcha filiallar — analitika',
                  en: 'All branches — analytics',
                  ru: 'Все филиалы — аналитика'
                })
              : t({
                  uz: 'Filialingiz analitikasi',
                  en: 'Your branch analytics',
                  ru: 'Аналитика вашего филиала'
                })}
          </Title>
          <Text type="secondary" className="text-xs">
            {t({
              uz: "Ma'lumotlar real vaqtda serverdan yuklanadi",
              en: 'Data loaded in real time from server',
              ru: 'Данные загружаются в реальном времени'
            })}
          </Text>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-50 px-4 py-2 dark:bg-teal-900/20">
          <BarChart3 size={16} className="text-teal-500" />
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
            {soldPct}% {t({ uz: 'sotilgan', en: 'sold', ru: 'продано' })}
          </span>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* KPI Cards */}
        <Row gutter={[16, 16]}>
          {statCards.map((s) => (
            <Col xs={24} sm={12} xl={6} key={s.key}>
              <KpiCard
                label={s.label}
                value={s.value}
                icon={s.icon}
                color={s.color}
                sub={s.sub}
                trend={s.trend}
              />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className="mt-5">
          {/* Pie chart */}
          <Col xs={24} lg={10}>
            <div className="h-full rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-[#101010]">
              <p className="mb-4 font-semibold text-slate-800 dark:text-white">
                {t({
                  uz: 'Kvartira holatlari',
                  en: 'Unit status breakdown',
                  ru: 'Статусы квартир'
                })}
              </p>
              {pieData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-slate-400 text-sm">
                  {t({ uz: "Ma'lumot yo'q", en: 'No data', ru: 'Нет данных' })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent || 1) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Col>

          {/* Bar chart */}
          <Col xs={24} lg={14}>
            <div className="h-full rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-[#101010]">
              <p className="mb-4 font-semibold text-slate-800 dark:text-white">
                {t({
                  uz: 'Filial kesimida taqqoslash',
                  en: 'Per-branch comparison',
                  ru: 'Сравнение по филиалам'
                })}
              </p>
              {barData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-slate-400 text-sm">
                  {t({
                    uz: "Hozircha filial yo'q",
                    en: 'No branches yet',
                    ru: 'Нет филиалов'
                  })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Legend iconType="circle" iconSize={10} />
                    <Bar
                      dataKey="Sotuvda"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="Bron" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="Sotilgan"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Col>
        </Row>

        {/* Sold progress per branch */}
        {rows.length > 0 && (
          <Row gutter={[16, 16]} className="mt-2">
            <Col xs={24} lg={12}>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-[#101010]">
                <p className="mb-4 font-semibold text-slate-800 dark:text-white">
                  {t({
                    uz: 'Sotilish darajasi — filiallar',
                    en: 'Sales rate — branches',
                    ru: 'Уровень продаж — филиалы'
                  })}
                </p>
                {rows.map((r) => (
                  <SoldRatioBar
                    key={r.branchId}
                    label={r.name}
                    sold={r.sold}
                    total={r.total}
                    color="#6366f1"
                  />
                ))}
              </div>
            </Col>

            {/* Detailed table */}
            <Col xs={24} lg={12}>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-[#101010]">
                <p className="mb-4 font-semibold text-slate-800 dark:text-white">
                  {t({
                    uz: 'Filial jadvali',
                    en: 'Branch table',
                    ru: 'Таблица филиалов'
                  })}
                </p>
                <Table<OverviewRow>
                  rowKey="branchId"
                  dataSource={rows}
                  size="small"
                  pagination={false}
                  scroll={{ y: 220 }}
                  locale={{
                    emptyText: t({
                      uz: "Ma'lumot yo'q",
                      en: 'No data',
                      ru: 'Нет данных'
                    })
                  }}
                  columns={[
                    {
                      title: t({ uz: 'Filial', en: 'Branch', ru: 'Филиал' }),
                      dataIndex: 'name',
                      render: (name: string, r) => (
                        <span className="font-medium">
                          {name}
                          {r.isVip && (
                            <AntTag color="gold" className="ml-1 text-[10px]">
                              VIP
                            </AntTag>
                          )}
                          {r.isBlocked && (
                            <AntTag color="red" className="ml-1 text-[10px]">
                              BLOK
                            </AntTag>
                          )}
                        </span>
                      )
                    },
                    {
                      title: t({ uz: 'Sotuvda', en: 'Sale', ru: 'Продажа' }),
                      dataIndex: 'forSale',
                      width: 70,
                      align: 'center' as const
                    },
                    {
                      title: t({ uz: 'Bron', en: 'Res.', ru: 'Бронь' }),
                      dataIndex: 'reserved',
                      width: 60,
                      align: 'center' as const
                    },
                    {
                      title: t({ uz: 'Sotildi', en: 'Sold', ru: 'Продано' }),
                      dataIndex: 'sold',
                      width: 70,
                      align: 'center' as const,
                      render: (v: number) => (
                        <span className="font-bold text-indigo-600">{v}</span>
                      )
                    },
                    {
                      title: t({ uz: 'Jami', en: 'Total', ru: 'Всего' }),
                      dataIndex: 'total',
                      width: 60,
                      align: 'center' as const
                    }
                  ]}
                />
              </div>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
}
