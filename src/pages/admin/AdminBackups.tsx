import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Input, Table, Typography, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined, ReloadOutlined, DownloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';

type Row = { filename: string; size: number; mtimeMs: number };

export default function AdminBackups() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [dumpLoading, setDumpLoading] = useState(false);
  const [clearAndWrite, setClearAndWrite] = useState(true);
  const [selected, setSelected] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Row[]>('/admin/backups');
      setRows(data);
    } catch {
      message.error('Backup ro‘yxati yuklanmadi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createDump = async () => {
    setDumpLoading(true);
    try {
      const { data } = await api.post<{ filename: string; size: number }>('/admin/backups/dump');
      message.success(`Yaratildi: ${data.filename}`);
      await load();
    } catch {
      message.error('pg_dump yo‘q yoki xatolik (serverda PostgreSQL client kerak)');
    } finally {
      setDumpLoading(false);
    }
  };

  const downloadFile = useCallback(async (filename: string) => {
    try {
      const res = await api.get(`/admin/backups/download/${encodeURIComponent(filename)}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Yuklab olishda xatolik');
    }
  }, []);

  const columns = useMemo<ColumnsType<Row>>(
    () => [
      { title: 'Filename', dataIndex: 'filename' },
      {
        title: 'Size',
        dataIndex: 'size',
        width: 140,
        render: (v: number) => `${Math.round(v / 1024)} KB`,
      },
      {
        title: 'Updated',
        dataIndex: 'mtimeMs',
        width: 200,
        render: (v: number) => new Date(v).toLocaleString(),
      },
      {
        title: '',
        width: 220,
        render: (_, r) => (
          <div className="flex flex-wrap gap-2">
            <Button type={selected === r.filename ? 'primary' : 'default'} onClick={() => setSelected(r.filename)}>
              Tanlash
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => void downloadFile(r.filename)}>
              Yuklab olish
            </Button>
          </div>
        ),
      },
    ],
    [selected, downloadFile],
  );

  const restore = async () => {
    if (!selected) {
      message.warning('Backup tanlang');
      return;
    }
    setRestoreLoading(true);
    try {
      await api.post('/admin/backups/restore', { filename: selected, clearAndWrite });
      message.success('Restore boshlandi/tugadi');
    } catch {
      message.error('Restore xatolik');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Typography.Title level={4}>Backup</Typography.Title>

      <Card
        title="Upload"
        extra={
          <div className="flex flex-wrap gap-2">
            <Button
              type="primary"
              icon={<DatabaseOutlined />}
              loading={dumpLoading}
              onClick={() => void createDump()}
            >
              DB dump (pg_dump)
            </Button>
            <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void load()}>
              Yangilash
            </Button>
          </div>
        }
      >
        <Upload
          accept=".sql"
          showUploadList={false}
          customRequest={async (opt) => {
            const f = opt.file as File;
            const fd = new FormData();
            fd.append('file', f);
            try {
              await api.post('/admin/backups/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              message.success('Yuklandi');
              await load();
              opt.onSuccess?.({}, new XMLHttpRequest());
            } catch {
              message.error('Upload xatolik');
              opt.onError?.(new Error('upload failed'));
            }
          }}
        >
          <Button icon={<UploadOutlined />}>.sql yuklash</Button>
        </Upload>
      </Card>

      <Card title="Restore">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Input value={selected} onChange={(e) => setSelected(e.target.value)} placeholder="filename.sql" className="max-w-md" />
          <Checkbox checked={clearAndWrite} onChange={(e) => setClearAndWrite(e.target.checked)}>
            Clear and write
          </Checkbox>
          <Button type="primary" loading={restoreLoading} onClick={() => void restore()}>
            Restore
          </Button>
        </div>
        <Table<Row>
          rowKey="filename"
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
}

