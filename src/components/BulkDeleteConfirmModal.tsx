import { useEffect, useState } from 'react';
import { Modal, Radio, Space, Typography } from 'antd';

export type BulkDeleteChoice = 'selected' | 'all_in_scope';

export type BulkDeleteConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  /** e.g. "xodimlar", "mijozlar" */
  entityLabel: string;
  selectedCount: number;
  /** Explains option B (API scope / filters). */
  scopeDescription: string;
  /** When false, only "tanlanganlar" is offered. */
  allowAllInScope?: boolean;
  onConfirm: (choice: BulkDeleteChoice) => Promise<void>;
};

export function BulkDeleteConfirmModal({
  open,
  onClose,
  entityLabel,
  selectedCount,
  scopeDescription,
  allowAllInScope = true,
  onConfirm,
}: BulkDeleteConfirmModalProps) {
  const [choice, setChoice] = useState<BulkDeleteChoice>('selected');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setChoice(
        selectedCount > 0 ? 'selected' : allowAllInScope ? 'all_in_scope' : 'selected',
      );
    }
  }, [open, selectedCount, allowAllInScope]);

  const okDisabled =
    choice === 'selected'
      ? selectedCount === 0
      : !allowAllInScope;

  const handleOk = async () => {
    if (okDisabled) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(choice);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`${entityLabel} — o‘chirishni tasdiqlash`}
      open={open}
      onCancel={onClose}
      onOk={() => void handleOk()}
      okText="O‘chirish"
      okButtonProps={{ danger: true, loading, disabled: okDisabled }}
      cancelText="Bekor qilish"
      destroyOnClose
    >
      <Space direction="vertical" size="middle" className="w-full py-2">
        <Typography.Text type="secondary">
          Qaysi yozuvlar o‘chirilishini tanlang.
        </Typography.Text>
        <Radio.Group
          value={choice}
          onChange={(e) => setChoice(e.target.value as BulkDeleteChoice)}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            <Radio value="selected" disabled={selectedCount === 0}>
              Faqat tanlangan qatorlar ({selectedCount} ta)
            </Radio>
            {allowAllInScope ? (
              <Radio value="all_in_scope">
                <span className="whitespace-normal">{scopeDescription}</span>
              </Radio>
            ) : null}
          </Space>
        </Radio.Group>
      </Space>
    </Modal>
  );
}
