import React from 'react';

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`shimmer rounded-lg ${className}`}></div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass p-5 rounded-2xl flex flex-col justify-between h-[160px]">
      <div className="flex justify-between items-start mb-4">
        <LoadingSkeleton className="w-12 h-12 rounded-xl" />
        <LoadingSkeleton className="w-16 h-6 rounded-full" />
      </div>
      <div>
        <LoadingSkeleton className="w-24 h-8 mb-2" />
        <LoadingSkeleton className="w-32 h-4" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between pb-4 border-b border-border">
        <LoadingSkeleton className="w-24 h-6" />
        <LoadingSkeleton className="w-32 h-6" />
        <LoadingSkeleton className="w-48 h-6" />
        <LoadingSkeleton className="w-20 h-6" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2">
          <LoadingSkeleton className="w-24 h-4" />
          <LoadingSkeleton className="w-32 h-4" />
          <LoadingSkeleton className="w-48 h-4" />
          <LoadingSkeleton className="w-20 h-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
