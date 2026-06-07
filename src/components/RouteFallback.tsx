import { Spin } from 'antd';

const RouteFallback = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: '60vh',
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default RouteFallback;
