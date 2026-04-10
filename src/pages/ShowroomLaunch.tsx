import { RectangleGoggles } from 'lucide-react';
import { Button, Typography } from 'antd';

const showroom =
  import.meta.env.VITE_SHOWROOM_URL ?? 'http://localhost:5174';

const mqttHint = import.meta.env.VITE_MQTT_TOPIC_HINT ?? '';

export default function ShowroomLaunch() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-6 p-8 text-center">
      <RectangleGoggles size={48} className="text-teal-400" />
      <Typography.Title level={3} className="!mb-0">
        Ko‘rgazma (showroom)
      </Typography.Title>
      <Typography.Text type="secondary" className="max-w-md">
        Vitrina alohida ilova sifatida ochiladi (login talab qilinmaydi).
        {mqttHint ? (
          <>
            <br />
            <span className="mt-2 block font-mono text-xs text-teal-600/90 dark:text-teal-400/90">
              MQTT misol mavzu: {mqttHint}
            </span>
          </>
        ) : null}
      </Typography.Text>
      <Button
        type="primary"
        size="large"
        className="!bg-teal-500 !border-teal-500 hover:!bg-teal-400"
        onClick={() => window.open(showroom, '_blank', 'noopener,noreferrer')}
      >
        Showroomni yangi tabda ochish
      </Button>
    </div>
  );
}
