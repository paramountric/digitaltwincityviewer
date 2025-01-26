import { ClockIcon } from '@heroicons/react/24/outline';
import { useUi } from '../hooks/ui';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function BottomMenu() {
  const {
    state: { showTimelineX },
    actions: { setShowTimelineX },
  } = useUi();
  return (
    <div className="absolute z-50 bottom-0 left-0 bg-white p-5 pt-0">
      <button
        type="button"
        onClick={() => setShowTimelineX(!showTimelineX)}
        className={classNames(
          showTimelineX ? 'text-blue-700' : 'text-gray-400',
          'rounded-full bg-white p-1 text-gray-400 hover:text-gray-600 focus:outline-none'
        )}
      >
        <span className="sr-only">View timeline</span>
        <ClockIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
