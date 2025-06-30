import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Popover } from 'antd';
import roomImage from '@/assets/room.png';
export type roomDto = {
  _id: string;
  block: 'block1' | 'block2' | 'block3' | 'block4';
  floor: number;
  room: number;
  status: 'empty' | 'broned' | 'selled';
};

const generateMockRooms = (count: number, block: roomDto['block']): roomDto[] =>
  Array.from({ length: count }, (_, i) => ({
    _id: `${block}-${i + 1}`,
    block,
    floor: Math.floor(i / 5) + 1,
    room: (i % 5) + 1,
    status: ['empty', 'broned', 'selled'][
      Math.floor(Math.random() * 3)
    ] as roomDto['status']
  }));

const RoomTable = () => {
  const [allAppartments, setAllAppartments] = useState<roomDto[]>([]);

  useEffect(() => {
    const mockData = [
      ...generateMockRooms(42, 'block1'),
      ...generateMockRooms(70, 'block2'),
      ...generateMockRooms(48, 'block3'),
      ...generateMockRooms(42, 'block4')
    ];
    setAllAppartments(mockData);
  }, []);

  const ablock = allAppartments.filter((a) => a.block === 'block1');
  const bblock = allAppartments.filter((a) => a.block === 'block2');
  const cblock = allAppartments.filter((a) => a.block === 'block3');
  const dblock = allAppartments.filter((a) => a.block === 'block4');

  const mapF = (arr: roomDto[]) =>
    arr?.map((apartment: roomDto, index: number) => (
      <Popover
        key={apartment._id}
        content={
          <motion.div
            className="w-[300px] h-full"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
          >
            <div className="w-full  bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
              <Image
                src={roomImage}
                alt="room"
                width={150}
                height={150}
                preview={true}
                className="w-[150px] h-full"
              />
            </div>
            <div>
              <p className="text-lg font-bold">Xonadon: {apartment.room}</p>
              <p>Qavat: {apartment.floor}</p>
              <p>Status: {apartment.status}</p>
              <p>Block: {apartment.block}</p>
              <p>Narx: {apartment.floor}000 000$</p>
            </div>
          </motion.div>
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.02 }}
          className={`w-[85px] rounded-xl h-[75px] cursor-pointer hover:scale-105 transition-transform ${
            apartment.status === 'empty'
              ? 'bg-gradient-to-br from-[#6bd2bc] to-[#5bc4a7] hover:from-[#5bc4a7] hover:to-[#4ab191]'
              : apartment.status === 'broned'
              ? 'bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600'
              : 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600'
          }`}
        >
          <div className="flex items-center justify-center w-full h-full">
            <h1 className="text-2xl font-bold text-white">{index + 1}</h1>
          </div>
        </motion.div>
      </Popover>
    ));

  const renderBlock = (title: string, blockRooms: roomDto[]) => (
    <motion.div
      className="w-[500px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full flex gap-1 text-center text-2xl font-bold ">
        <h1 className="text-slate-900 dark:text-white">{title}</h1>
      </div>
      <div className="w-full grid grid-cols-5 gap-5">{mapF(blockRooms)}</div>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center rounded-lg">
      <div className="relative overflow-auto flex flex-col gap-10 w-full h-full p-2">
        <div className="grid grid-cols-4 gap-[80px] w-[2100px]">
          {renderBlock('Block A', ablock)}
          {renderBlock('Block B', bblock)}
          {renderBlock('Block C', cblock)}
          {renderBlock('Block D', dblock)}
        </div>
      </div>
    </div>
  );
};

export default RoomTable;
