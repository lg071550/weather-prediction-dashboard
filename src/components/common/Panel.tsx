import type { ReactNode } from 'react';
import type { FeedStatus } from '../../types/weather';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorBanner } from './ErrorBanner';

interface PanelProps {
  title: string;
  feedStatus?: FeedStatus;
  feedName?: string;
  children: ReactNode;
}

export function Panel({ title, feedStatus, feedName, children }: PanelProps) {
  return (
    <div className="panel min-w-0 rounded-xl bg-surface-800/92 backdrop-blur-sm border border-surface-600/35 overflow-hidden transition-all duration-300 hover:border-surface-500/55">
      <div className="relative px-4 py-3 border-b border-surface-600/40 flex items-center justify-center">
        <h3 className="text-sm font-semibold text-surface-200 text-center">{title}</h3>
        {feedStatus?.isLoading && (
          <div className="absolute right-4 w-3 h-3 rounded-full border-2 border-accent-400 border-t-transparent animate-spin" />
        )}
      </div>
      <div className="min-w-0 p-4">
        {feedStatus?.isError && feedName && feedStatus.errorMessage && (
          <div className="mb-3">
            <ErrorBanner message={feedStatus.errorMessage} feedName={feedName} />
          </div>
        )}
        {feedStatus?.isLoading && !feedStatus?.lastRefresh ? (
          <LoadingSkeleton rows={4} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
