import { Panel } from '../common/Panel';

interface WindyMapPanelProps {
  lat: number;
  lon: number;
}

export function WindyMapPanel({ lat, lon }: WindyMapPanelProps) {
  const src =
    `https://embed.windy.com/embed.html` +
    `?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h` +
    `&zoom=9&overlay=temp&product=ecmwf&level=surface` +
    `&lat=${lat}&lon=${lon}`;

  return (
    <Panel title="Windy Live Map">
      <div
        className="w-full overflow-hidden rounded-lg"
        style={{ height: 'clamp(18rem, 22vw, 26rem)' }}
      >
        <iframe
          src={src}
          title="Windy Weather Map"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </Panel>
  );
}
