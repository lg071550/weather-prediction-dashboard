import { CITIES } from '../../config/cities';
import { useUiStore } from '../../store/uiStore';

export function CityTabs() {
  const { selectedCityId, setSelectedCityId } = useUiStore();

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-surface-800/60 backdrop-blur-sm border border-surface-700/50">
      {CITIES.map((city) => {
        const isActive = city.id === selectedCityId;
        return (
          <button
            key={city.id}
            onClick={() => setSelectedCityId(city.id)}
            className={`
              px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
              }
            `}
          >
            {city.displayName}
          </button>
        );
      })}
    </div>
  );
}
