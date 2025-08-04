import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
import { useMemo, useRef, useState } from "react";
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  zoomPlugin
);

function smoothPoints(points, windowSize = 5) {
  return points.map((_, i, arr) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const window = arr.slice(start, i + 1);
    const avg = window.reduce((sum, p) => sum + p.y, 0) / window.length;
    return { ...points[i], y: avg };
  });
}

const randomColor = (() => {
  const cache = new Map();
  return (id) => {
    if (cache.has(id)) return cache.get(id);
    const hash = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const hue = hash % 360;
    const color = `hsla(${hue}, 80%, 60%, 0.8)`;
    cache.set(id, color);
    return color;
  };
})();

function ChartViewer({ data, selectedExperiments, isLoading, isSmooth }) {
  const chartRefs = useRef({});
  const [fullscreenMetric, setFullscreenMetric] = useState(null);

  const grouped = useMemo(() => {
    if (selectedExperiments.length === 0) return {};

    const result = {};
    for (const row of data) {
      const { experiment_id, metric_name, step, value } = row;
      if (!selectedExperiments.includes(experiment_id)) continue;

      if (!result[metric_name]) result[metric_name] = {};
      if (!result[metric_name][experiment_id]) {
        result[metric_name][experiment_id] = [];
      }

      result[metric_name][experiment_id].push({
        x: Number(step),
        y: Number(value),
      });
    }

    return result;
  }, [data, selectedExperiments]);

  const handleResetZoom = (metric) => {
    const chart = chartRefs.current[metric];
    if (chart) {
      chart.resetZoom();
    }
  };

  const toggleFullscreen = (metric) => {
    setFullscreenMetric(fullscreenMetric === metric ? null : metric);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (selectedExperiments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">Select experiments to display charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {fullscreenMetric && grouped[fullscreenMetric] && (
        <div className="fixed inset-0 z-50 bg-white p-8 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{fullscreenMetric}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleResetZoom(fullscreenMetric)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Reset Zoom
              </button>
              <button
                onClick={() => toggleFullscreen(null)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close fullscreen"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Line
              ref={(el) => (chartRefs.current[fullscreenMetric] = el)}
              data={{
                datasets: Object.entries(grouped[fullscreenMetric]).map(
                  ([experiment_id, points]) => ({
                    label: experiment_id,
                    data: isSmooth
                      ? smoothPoints(points.sort((a, b) => a.x - b.x))
                      : points.sort((a, b) => a.x - b.x),
                    fill: false,
                    borderColor: randomColor(experiment_id),
                    backgroundColor: randomColor(experiment_id),
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 1,
                  })
                ),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      usePointStyle: true,
                    },
                  },
                  zoom: {
                    zoom: {
                      wheel: {
                        enabled: true,
                      },
                      pinch: {
                        enabled: true,
                      },
                      mode: 'xy',
                    },
                    pan: {
                      enabled: true,
                      mode: 'xy',
                    },
                    limits: {
                      x: { min: 'original', max: 'original' },
                      y: { min: 'original', max: 'original' },
                    }
                  },
                  tooltip: {
                    mode: 'nearest',
                    intersect: false,
                  },
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'xy',
                  intersect: false,
                },
                scales: {
                  x: {
                    type: "linear",
                    title: { display: true, text: "Step" },
                  },
                  y: {
                    title: { display: true, text: "Value" },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([metric, expMap]) => (
        <div
          key={metric}
          className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${
            fullscreenMetric ? 'hidden' : ''
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{metric}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleFullscreen(metric)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                title="Expand to fullscreen"
                aria-label={`Expand ${metric} to fullscreen`}
              >
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="h-80">
            <Line
              ref={(el) => (chartRefs.current[metric] = el)}
              data={{
                datasets: Object.entries(expMap).map(
                  ([experiment_id, points]) => ({
                    label: experiment_id,
                    data: isSmooth
                      ? smoothPoints(points.sort((a, b) => a.x - b.x))
                      : points.sort((a, b) => a.x - b.x),
                    fill: false,
                    borderColor: randomColor(experiment_id),
                    backgroundColor: randomColor(experiment_id),
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 1,
                  })
                ),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      usePointStyle: true,
                    },
                  },
                  zoom: {
                    zoom: {
                      wheel: {
                        enabled: true,
                      },
                      pinch: {
                        enabled: true,
                      },
                      mode: 'xy',
                    },
                    pan: {
                      enabled: true,
                      mode: 'xy',
                    },
                    limits: {
                      x: { min: 'original', max: 'original' },
                      y: { min: 'original', max: 'original' },
                    }
                  },
                  tooltip: {
                    mode: 'nearest',
                    intersect: false,
                  },
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'xy',
                  intersect: false,
                },
                scales: {
                  x: {
                    type: "linear",
                    title: { display: true, text: "Step" },
                  },
                  y: {
                    title: { display: true, text: "Value" },
                  },
                },
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChartViewer;