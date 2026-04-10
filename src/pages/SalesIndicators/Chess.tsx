import { useMemo } from 'react';
import { Empty } from 'antd';
import type { BlockRow } from '@/api/blocks';

export type SalesRoomRow = {
  _id: string;
  blockId: string;
  blockLabel: string;
  floor: number;
  room: number;
  status: 'empty' | 'broned' | 'selled';
  areaSqm: string | null;
};

type ChessBoardProps = {
  blocks: BlockRow[];
  rooms: SalesRoomRow[];
  emptyHint?: string;
};

function cellClass(status: SalesRoomRow['status']) {
  if (status === 'empty') {
    return 'bg-gradient-to-br from-[#6bd2bc] to-[#5bc4a7] hover:from-[#5bc4a7] hover:to-[#4ab191]';
  }
  if (status === 'broned') {
    return 'bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600';
  }
  return 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600';
}

export default function ChessBoard({
  blocks,
  rooms,
  emptyHint,
}: ChessBoardProps) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.name.localeCompare(b.name)),
    [blocks],
  );

  if (!sortedBlocks.length) {
    return (
      <div className="flex min-h-[240px] w-full items-center justify-center p-6">
        <Empty description={emptyHint ?? 'Bloklar mavjud emas'} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg">
      <div className="relative flex h-full w-full flex-col gap-10 overflow-auto p-2">
        <div
          className="flex flex-wrap justify-center gap-x-[48px] gap-y-10"
          style={{ maxWidth: '100%' }}
        >
          {sortedBlocks.map((block) => {
            const blockRooms = rooms.filter((r) => r.blockId === block.id);
            const sorted = [...blockRooms].sort(
              (a, b) => a.floor - b.floor || a.room - b.room,
            );
            return (
              <div key={block.id} className="w-full min-w-[260px] max-w-[520px] sm:w-auto">
                <div className="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">
                  {block.name}
                  {block.code ? (
                    <span className="ml-2 text-base font-normal text-slate-500">
                      ({block.code})
                    </span>
                  ) : null}
                </div>
                {!sorted.length ? (
                  <Empty className="my-6" description="Bu blokda kvartira yo‘q" />
                ) : (
                  <div className="grid grid-cols-5 gap-3 sm:gap-5">
                    {sorted.map((apartment) => (
                      <div
                        key={apartment._id}
                        className={`h-[68px] w-[72px] cursor-pointer rounded-xl transition-transform hover:scale-105 sm:h-[75px] sm:w-[85px] ${cellClass(
                          apartment.status,
                        )}`}
                        title={`${apartment.floor}-qavat · №${apartment.room}`}
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-xl font-bold text-white sm:text-2xl">
                            {apartment.room || '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
