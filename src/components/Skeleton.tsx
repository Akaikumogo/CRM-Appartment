import { Skeleton, Card, Row, Col } from 'antd';
import { motion } from 'motion/react';

const DashboardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Statistics Skeleton */}
      <Row gutter={[24, 24]}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Col xs={24} sm={6} key={idx}>
            <Card className="border-0">
              <Skeleton active paragraph={false} title={{ width: '80%' }} />
              <Skeleton.Input active size="large" />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Section Skeleton */}
      <Card>
        <Skeleton.Input active size="default" />
        <Row gutter={[16, 16]}>
          {[...Array(3)].map((_, i) => (
            <Col xs={24} sm={8} key={i}>
              <Skeleton.Input active block />
            </Col>
          ))}
        </Row>
      </Card>

      {/* Table Skeleton */}
      <Card title={<Skeleton.Input style={{ width: 200 }} active />}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </motion.div>
  );
};

export default DashboardSkeleton;
