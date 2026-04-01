import React from 'react';

export interface LockIndicatorProps {
  blockId: string;
  username: string;
  timeRemaining?: number;
  isMyLock: boolean;
}

export const LockIndicator: React.FC<LockIndicatorProps> = ({
  blockId,
  username,
  timeRemaining = 30,
  isMyLock,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 text-[9px] font-black uppercase border-2 border-[#1A1A1A] rounded ${
        isMyLock
          ? 'bg-[#39FF14] text-[#1A1A1A]'
          : 'bg-[#FF5722] text-white'
      }`}
    >
      <div className={`h-1.5 w-1.5 rounded-full ${isMyLock ? 'bg-[#1A1A1A]' : 'bg-white'} animate-pulse`}></div>
      <span>🔒 {isMyLock ? 'YOU' : username.toUpperCase()}</span>
      {timeRemaining && timeRemaining < 10 && (
        <span className="ml-1">({timeRemaining}s)</span>
      )}
    </div>
  );
};

export interface BlockStatusBadgeProps {
  status: 'locked' | 'editable' | 'readonly';
  username?: string;
}

export const BlockStatusBadge: React.FC<BlockStatusBadgeProps> = ({
  status,
  username,
}) => {
  const statusConfig = {
    locked: {
      bg: 'bg-[#FF5722]',
      text: 'text-white',
      label: `🔒 Locked by ${username}`,
    },
    editable: {
      bg: 'bg-[#39FF14]',
      text: 'text-[#1A1A1A]',
      label: '✓ Editable',
    },
    readonly: {
      bg: 'bg-[#1A1A1A]',
      text: 'text-white',
      label: '👁 Read-only',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-[#1A1A1A] ${config.bg} ${config.text}`}>
      {config.label}
    </div>
  );
};

export interface LockWarningDialogProps {
  blockId: string;
  lockedByUsername: string;
  onClose: () => void;
  onEditOther: () => void;
}

export const LockWarningDialog: React.FC<LockWarningDialogProps> = ({
  blockId,
  lockedByUsername,
  onClose,
  onEditOther,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-4 border-[#FF5722] bg-white shadow-[12px_12px_0px_0px_#FF5722] max-w-sm">
        <div className="bg-[#FF5722] text-white p-4 font-black uppercase text-sm">
          🔒 Block Locked
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="font-bold text-[#1A1A1A]">
              <code className="bg-[#F4F0EA] px-2 py-1">{blockId}</code>
            </p>
            <p className="text-sm text-[#1A1A1A]">
              is currently being edited by <span className="font-bold">{lockedByUsername}</span>
            </p>
          </div>

          <div className="bg-[#F4F0EA] border-l-4 border-[#FF5722] p-3">
            <p className="text-xs font-bold text-[#1A1A1A]">
              💡 Tip: You can edit other functions while waiting for this block to become available.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEditOther}
              className="flex-1 border-3 border-[#1A1A1A] bg-[#39FF14] text-[#1A1A1A] px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 active:shadow-none transition-all"
            >
              Edit Other Block
            </button>
            <button
              onClick={onClose}
              className="flex-1 border-3 border-[#1A1A1A] bg-[#1A1A1A] text-white px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 active:shadow-none transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface LocksListProps {
  locks: Array<{
    blockId: string;
    blockType: string;
    username: string;
    isMyLock: boolean;
  }>;
}

export const LocksList: React.FC<LocksListProps> = ({ locks }) => {
  if (locks.length === 0) {
    return (
      <div className="p-4 text-center text-xs font-bold text-[#1A1A1A]/50">
        NO_ACTIVE_LOCKS
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      {locks.map((lock) => (
        <div
          key={lock.blockId}
          className="border-2 border-[#1A1A1A] bg-white p-2 shadow-[2px_2px_0px_0px_#1A1A1A]"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase truncate">
                {lock.blockId}
              </p>
              <p className="text-[8px] text-[#1A1A1A]/70">{lock.blockType}</p>
            </div>
            <LockIndicator
              blockId={lock.blockId}
              username={lock.username}
              isMyLock={lock.isMyLock}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
