'use client';
import { useEffect, useState, useRef, useCallback, useDeferredValue } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/Notification';
import { getBlockAtCursor, parseCodeBlocks, type CodeBlock } from '@/lib/codeBlockParser';
import {
  LockIndicator,
  BlockStatusBadge,
  LockWarningDialog,
  LocksList,
} from '@/components/LockIndicators';

export default function RoomPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const monaco = useMonaco();
  const socketRef = useRef<Socket | null>(null);
  const lockRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type Room = {
    _id: string;
    title: string;
    description: string;
    code: string;
    host: {
      _id: string;
      username: string;
    };
    participants: Array<{
      _id: string;
      username: string;
    }>;
    editorsAccess: string[];
    language: string;
    isLive: boolean;
  };

  type ChatMessage = {
    id: string;
    user: string;
    message: string;
    timestamp: number;
  };

  type LockInfo = {
    blockId: string;
    blockType: string;
    lockedBy: string;
    username: string;
    timestamp: number;
  };

  const [room, setRoom] = useState<Room | null>(null);
  const [code, setCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState<CodeBlock | null>(null);
  const [locks, setLocks] = useState<Map<string, LockInfo>>(new Map());
  const [myLocks, setMyLocks] = useState<Set<string>>(new Set());
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockDialogInfo, setLockDialogInfo] = useState<LockInfo | null>(null);

  const userId = session?.user?.id;
  const roomIdString = Array.isArray(id) ? id[0] : id;

  // Initialize socket connection
  useEffect(() => {
    if (!roomIdString) return;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!BACKEND_URL) {
      setError('Backend URL not configured');
      return;
    }

    try {
      socketRef.current = io(BACKEND_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setError(null);
        socketRef.current?.emit('joinRoom', roomIdString);
      });

      socketRef.current.on('updateEditor', (content: string) => {
        setCode(content);
      });

      socketRef.current.on('newComment', (comment: Omit<ChatMessage, 'id'>) => {
        setChat((prev) => [...prev, { ...comment, id: `${Date.now()}-${Math.random()}` }]);
      });

      socketRef.current.on('editorAccessUpdated', ({ userId, action }: { userId: string; action: 'grant' | 'revoke' }) => {
        setRoom((prevRoom) => {
          if (!prevRoom) return prevRoom;
          if (action === 'grant') {
            if (!prevRoom.editorsAccess.includes(userId)) {
              return { ...prevRoom, editorsAccess: [...prevRoom.editorsAccess, userId] };
            }
          } else if (action === 'revoke') {
            return { ...prevRoom, editorsAccess: prevRoom.editorsAccess.filter((id) => id !== userId) };
          }
          return prevRoom;
        });
      });

      // Lock events
      socketRef.current.on('blockLocked', (lockInfo: LockInfo) => {
        setLocks((prev) => new Map(prev).set(lockInfo.blockId, lockInfo));

        if (lockInfo.lockedBy === userId) {
          setMyLocks((prev) => new Set(prev).add(lockInfo.blockId));
          showNotification(`🔒 Editing: ${lockInfo.blockId}`, 'info');
        } else {
          showNotification(
            `🔒 ${lockInfo.username} is editing ${lockInfo.blockId}`,
            'warning'
          );
        }
      });

      socketRef.current.on('blockUnlocked', ({ blockId }: { blockId: string }) => {
        setLocks((prev) => {
          const updated = new Map(prev);
          updated.delete(blockId);
          return updated;
        });

        if (myLocks.has(blockId)) {
          setMyLocks((prev) => {
            const updated = new Set(prev);
            updated.delete(blockId);
            return updated;
          });
        }
      });

      socketRef.current.on('blockLockDenied', ({ blockId, reason }: { blockId: string; reason?: string }) => {
        showNotification(`Cannot edit ${blockId}: ${reason || 'Block is locked'}`, 'error');
        setShowLockDialog(true);
      });

      socketRef.current.on('roomDeleted', () => {
        setError('Room has been deleted');
        setTimeout(() => router.push('/dashboard/rooms'), 2000);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError('Connection failed. Retrying...');
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (err) {
      console.error('Socket setup error:', err);
      setError('Failed to initialize connection');
    }
  }, [roomIdString, router]);

  // Fetch room data
  useEffect(() => {
    if (!roomIdString || !userId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const roomRes = await fetch(`/api/rooms/room?id=${roomIdString}`);
        if (!roomRes.ok) throw new Error('Failed to fetch room');

        const roomData = await roomRes.json();
        
        // Verify room exists and is live
        if (!roomData || !roomData.isLive) {
          setError('Room is not available');
          setTimeout(() => router.push('/dashboard/rooms'), 2000);
          return;
        }

        setRoom(roomData);
        setCode(roomData.code || '');
        setIsHost(roomData.host._id === userId);
        
        // Parse code blocks
        const blocks = parseCodeBlocks(roomData.code || '', roomData.language);
        setCodeBlocks(blocks);

        // Fetch chat history
        const chatRes = await fetch(`/api/rooms/chat?id=${roomIdString}`);
        if (!chatRes.ok) throw new Error('Failed to fetch chat');

        const chatData = await chatRes.json();
        setChat(
          chatData.chat.map((msg: any, idx: number) => ({
            id: `${msg.timestamp}-${idx}`,
            ...msg,
          }))
        );

        // Join room if not host
        if (roomData.host._id !== userId) {
          const joinRes = await fetch(`/api/rooms/join?id=${roomIdString}`, {
            method: 'POST',
          });
          if (!joinRes.ok) throw new Error('Failed to join room');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomIdString, userId, router]);

  // Auto-save code
  const saveCodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!room || !code) return;

    // Debounce auto-save
    if (saveCodeRef.current) {
      clearTimeout(saveCodeRef.current);
    }

    saveCodeRef.current = setTimeout(() => {
      saveCode();
    }, 5000); // Save after 5 seconds of inactivity

    return () => {
      if (saveCodeRef.current) {
        clearTimeout(saveCodeRef.current);
      }
    };
  }, [code, room]);

  // Apply visual decorations for locked blocks
  const applyLockDecorations = useCallback(() => {
    if (!editorRef.current || !monaco) return;
    
    const editor = editorRef.current;
    const decorations: any[] = [];

    // Iterate through all code blocks and check if they're locked
    codeBlocks.forEach((block) => {
      const lockInfo = locks.get(block.id);
      if (!lockInfo) return;

      const isMyLock = myLocks.has(block.id);
      const color = isMyLock ? '#39FF14' : '#FF5722'; // Green for mine, orange for others
      const lightColor = isMyLock ? '#39FF1420' : '#FF572220'; // Light background

      // Add decorations for each line in the block
      for (let line = block.startLine + 1; line <= block.endLine + 1; line++) {
        decorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: `lock-${isMyLock ? 'mine' : 'other'}`,
            glyphMarginClassName: `lock-glyph-${isMyLock ? 'mine' : 'other'}`,
            glyphMarginHoverMessage: [
              { value: `🔒 Locked by ${lockInfo.username}` },
            ],
            minimap: {
              color: color,
              position: 2, // Render on the right
            },
          },
        });
      }
    });

    editor.deltaDecorations([], decorations);
  }, [codeBlocks, locks, myLocks, monaco]);

  // Apply decorations whenever locks change
  useEffect(() => {
    applyLockDecorations();
  }, [applyLockDecorations, locks, myLocks]);

  const handleCodeChange = useCallback(
    (value?: string, e?: any) => {
      if (!socketRef.current || !room) return;

      // Check if user can edit
      const canEdit = isHost || room.editorsAccess.includes(userId!);
      if (!canEdit) return;

      const newCode = value || '';
      
      // Get current cursor line to detect block change
      if (e && e.getPosition) {
        const position = e.getPosition();
        const lineNumber = position.lineNumber - 1; // Convert to 0-indexed
        const block = getBlockAtCursor(newCode, lineNumber, room.language);

        if (block && currentBlock?.id !== block.id) {
          // User moved to new block - try to acquire lock
          setCurrentBlock(block);
          requestBlockLock(block);
          return;
        }
      }

      setCode(newCode);

      // Refresh lock if currently holding one
      if (currentBlock && myLocks.has(currentBlock.id)) {
        socketRef.current.emit('refreshLock', {
          roomId: roomIdString,
          blockType: currentBlock.type,
          blockId: currentBlock.id,
        });
      }

      socketRef.current.emit('editorChange', {
        roomId: roomIdString,
        content: newCode,
        blockId: currentBlock?.id,
      });
    },
    [isHost, room, userId, roomIdString, currentBlock, myLocks]
  );

  const requestBlockLock = useCallback(
    async (block: CodeBlock) => {
      if (!socketRef.current || !room) return;

      try {
        const res = await fetch(
          `/api/rooms/lock?roomId=${roomIdString}&blockType=${block.type}&blockId=${block.id}`,
          { method: 'POST' }
        );

        const data = await res.json();

        if (!res.ok) {
          setLockDialogInfo(data.lockedBy);
          setShowLockDialog(true);
          showNotification(`Block "${block.id}" is locked by ${data.lockedBy?.username}`, 'warning');
          return;
        }

        // Emit lock event to others
        socketRef.current.emit('blockLockRequest', {
          roomId: roomIdString,
          blockType: block.type,
          blockId: block.id,
          username: session?.user?.username,
        });

        setMyLocks((prev) => new Set(prev).add(block.id));
        showNotification(`🔒 Editing: ${block.id}`, 'success');
      } catch (err) {
        console.error('Lock request error:', err);
        showNotification('Failed to acquire lock', 'error');
      }
    },
    [roomIdString, session?.user?.username, showNotification]
  );

  const releaseBlockLock = useCallback(
    async (blockId: string) => {
      if (!currentBlock) return;

      try {
        await fetch(
          `/api/rooms/unlock?roomId=${roomIdString}&blockType=${currentBlock.type}&blockId=${blockId}`,
          { method: 'POST' }
        );

        socketRef.current?.emit('blockUnlock', {
          roomId: roomIdString,
          blockType: currentBlock.type,
          blockId,
        });

        setMyLocks((prev) => {
          const updated = new Set(prev);
          updated.delete(blockId);
          return updated;
        });
      } catch (err) {
        console.error('Unlock error:', err);
      }
    },
    [roomIdString, currentBlock]
  );

  const saveCode = async () => {
    if (!room || !isConnected) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/rooms/room?id=${roomIdString}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error('Failed to save code');
    } catch (err) {
      console.error('Save error:', err);
      showNotification('ERROR: Failed to save code.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRoom = async () => {
    if (!room || !isHost) return;

    const confirmed = window.confirm('Are you sure you want to delete this room?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/rooms/room?id=${roomIdString}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete room');

      socketRef.current?.emit('deleteRoom', roomIdString);
      showNotification('SYSTEM: Room terminated successfully.', 'success');
      setTimeout(() => router.push('/dashboard/rooms'), 1500);
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('ERROR: Failed to delete room.', 'error');
      setError('Failed to delete room');
    }
  };

  const leaveRoom = async () => {
    if (!room) return;

    const confirmed = window.confirm('Are you sure you want to leave this room?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/rooms/leave?id=${roomIdString}`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to leave room');

      socketRef.current?.emit('userLeft', { roomId: roomIdString, userId });
      showNotification('SYSTEM: Disconnected from room.', 'success');
      setTimeout(() => router.push('/dashboard/rooms'), 1500);
    } catch (err) {
      console.error('Leave error:', err);
      showNotification('ERROR: Failed to leave room.', 'error');
      setError('Failed to leave room');
    }
  };

  const sendComment = async () => {
    if (!newComment.trim() || !isConnected || !socketRef.current) return;

    try {
      const comment = {
        user: session?.user?.username || 'Anonymous',
        message: newComment.trim(),
        timestamp: Date.now(),
      };

      // Save to database first
      const res = await fetch(`/api/rooms/chat?id=${roomIdString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      });

      if (!res.ok) throw new Error('Failed to send message');

      // Emit only after successful save
      socketRef.current.emit('sendComment', { roomId: roomIdString, comment });
      setNewComment('');
    } catch (err) {
      console.error('Send comment error:', err);
      showNotification('ERROR: Failed to send message.', 'error');
    }
  };

  const manageEditorAccess = async (participantId: string, action: 'grant' | 'revoke') => {
    if (!isHost) return;

    try {
      const res = await fetch(
        `/api/rooms/editor-access?roomId=${roomIdString}&userId=${participantId}&action=${action}`,
        { method: 'POST' }
      );

      if (!res.ok) throw new Error('Failed to manage editor access');

      const updatedRoom = await res.json();
      setRoom(updatedRoom.room);

      socketRef.current?.emit('editorAccessChanged', {
        roomId: roomIdString,
        userId: participantId,
        action,
      });

      showNotification(
        `SYSTEM: Editor access ${action === 'grant' ? 'granted' : 'revoked'}.`,
        'success'
      );
    } catch (err) {
      console.error('Editor access management error:', err);
      showNotification('ERROR: Failed to manage editor access.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="border-4 border-[#1A1A1A] bg-white p-8 shadow-[8px_8px_0px_0px_#1A1A1A]">
            <p className="font-black uppercase text-[#1A1A1A] mb-2">Loading room...</p>
            <div className="flex justify-center gap-1">
              <div className="h-2 w-2 bg-[#FF5722] animate-pulse"></div>
              <div className="h-2 w-2 bg-[#39FF14] animate-pulse"></div>
              <div className="h-2 w-2 bg-[#FFD700] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="border-4 border-[#FF5722] bg-[#FF5722]/10 p-6 shadow-[8px_8px_0px_0px_#FF5722]">
          <p className="font-black uppercase text-[#FF5722]">{error || 'Room not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] p-6 lg:p-10 flex flex-col gap-8">
      {/* Connection Status */}
      {!isConnected && (
        <div className="border-4 border-[#FFD700] bg-[#FFD700] text-[#1A1A1A] p-3 shadow-[8px_8px_0px_0px_#FFD700] font-black uppercase text-xs">
          ⏳ Connecting to server...
        </div>
      )}

      {/* ROOM HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-4 border-[#1A1A1A] bg-white p-6 shadow-[8px_8px_0px_0px_#1A1A1A]">
        <div className="space-y-1">
          <div className="inline-block border-2 border-[#1A1A1A] bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-black uppercase text-[#39FF14] mb-2">
            STATION_ID: {room._id.slice(-6)}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">{room.title}</h1>
          <p className="font-bold text-[#FF5722] text-sm uppercase tracking-widest">&gt; {room.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="border-4 border-[#1A1A1A] bg-[#FFD700] px-4 py-2 font-black uppercase text-xs">
            ENV: {room.language.toUpperCase()}
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 font-black text-xs uppercase border-2 ${isConnected ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]' : 'border-[#FF5722] bg-[#FF5722]/10 text-[#FF5722] animate-pulse'}`}>
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#39FF14]' : 'bg-[#FF5722]'}`}></div>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-[#1A1A1A] font-black text-xs uppercase animate-pulse">
              <div className="h-2 w-2 bg-[#FF5722] rounded-full"></div>
              SAVING...
            </div>
          )}
          {currentBlock && (
            <BlockStatusBadge
              status={
                myLocks.has(currentBlock.id)
                  ? 'editable'
                  : locks.has(currentBlock.id)
                  ? 'locked'
                  : 'editable'
              }
              username={locks.get(currentBlock.id)?.username}
            />
          )}
          <div className="flex flex-wrap gap-2">
            {isHost ? (
              <>
                <button
                  onClick={leaveRoom}
                  disabled={!isConnected}
                  className="border-4 border-[#1A1A1A] bg-[#1A1A1A] text-white px-4 py-2 font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1A1A1A] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  LEAVE
                </button>
                <button
                  onClick={deleteRoom}
                  disabled={!isConnected}
                  className="border-4 border-[#1A1A1A] bg-[#FF5722] text-white px-4 py-2 font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1A1A1A] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  TERMINATE_ROOM
                </button>
              </>
            ) : (
              <button
                onClick={leaveRoom}
                disabled={!isConnected}
                className="border-4 border-[#1A1A1A] bg-[#1A1A1A] text-white px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#1A1A1A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#1A1A1A] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                DISCONNECT
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-8">
        {/* EDITOR SECTION */}
        <div className="flex-[2] flex flex-col border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A] overflow-hidden">
          <div className="border-b-4 border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest">SOURCE_CODE_MATRIX</span>
            <div className="flex gap-1.5">
              <div className={`h-2 w-2 border border-white/20 ${isConnected ? 'bg-[#39FF14]' : 'bg-[#FF5722]'}`}></div>
              <div className="h-2 w-2 bg-[#39FF14] border border-white/20"></div>
            </div>
          </div>
          <div className="flex-1 min-h-[500px]">
            <Editor
              value={code}
              onChange={handleCodeChange}
              onMount={(editor) => {
                editorRef.current = editor;
                applyLockDecorations();
              }}
              language={room.language}
              theme="vs-dark"
              options={{
                readOnly: !isHost && !room.editorsAccess.includes(userId!),
                fontSize: 16,
                fontFamily: "var(--font-mono)",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 20,
                lineNumbersMinChars: 3,
              }}
            />
          </div>
          {!isHost && !room.editorsAccess.includes(userId!) && (
            <div className="bg-[#FF5722] text-white p-2 text-center text-[10px] font-black uppercase tracking-widest">
              CAUTION: ACCESS_MODE_READ_ONLY
            </div>
          )}
          {!isHost && room.editorsAccess.includes(userId!) && (
            <div className="bg-[#39FF14] text-[#1A1A1A] p-2 text-center text-[10px] font-black uppercase tracking-widest">
              ✓ EDITOR_ACCESS_GRANTED
            </div>
          )}
        </div>

        {/* CHAT/LOG SECTION */}
        <div className="flex-1 flex flex-col border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A] overflow-hidden">
          <div className="border-b-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-2 flex items-center justify-between font-black uppercase text-xs tracking-widest">
            COMM_LINK.LOG
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#1A1A1A] animate-pulse' : 'bg-[#FF5722]'}`}></div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-[#F4F0EA]">
            {chat.map((c) => (
              <div key={c.id} className="border-2 border-[#1A1A1A] bg-white p-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase bg-[#1A1A1A] text-[#39FF14] px-1 py-0.5">
                    {c.user}
                  </span>
                  <span className="text-[9px] text-[#1A1A1A]/50">
                    {new Date(c.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1A1A1A] break-words leading-tight">{c.message}</p>
              </div>
            ))}
            {chat.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.2em]">WAITING_FOR_DATA...</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t-4 border-[#1A1A1A] bg-white space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 border-4 border-[#1A1A1A] bg-[#F4F0EA] px-3 py-2 text-xs font-bold focus:bg-[#39FF14]/10 focus:outline-none placeholder:text-[#1A1A1A]/30 disabled:opacity-50"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                placeholder="INPUT_MESSAGE..."
                disabled={!isConnected}
              />
              <button
                className="border-4 border-[#1A1A1A] bg-[#39FF14] px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={sendComment}
                disabled={!isConnected}
              >
                PIPE
              </button>
            </div>
          </div>
        </div>

        {/* PARTICIPANTS SECTION - Only visible to host */}
        {isHost && (
          <div className="flex-1 max-h-[700px] flex flex-col border-4 border-[#1A1A1A] bg-white shadow-[12px_12px_0px_0px_#1A1A1A] overflow-hidden">
            <div className="border-b-4 border-[#1A1A1A] bg-[#FFD700] px-4 py-2 flex items-center justify-between font-black uppercase text-xs tracking-widest">
              PARTICIPANTS
              <span className="bg-[#1A1A1A] text-[#FFD700] px-2 py-1 text-[9px]">
                {room.participants.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-[#F4F0EA]">
              {/* Host entry */}
              <div className="border-3 border-[#1A1A1A] bg-white p-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase bg-[#FF5722] text-white px-1 py-0.5 inline-block mb-1">
                      HOST
                    </div>
                    <p className="font-bold text-[#1A1A1A]">{room.host.username}</p>
                  </div>
                  <div className="bg-[#39FF14] text-[#1A1A1A] px-2 py-1 text-[9px] font-black">
                    EDITOR
                  </div>
                </div>
              </div>

              {/* Participants */}
              {room.participants.length === 0 ? (
                <div className="flex items-center justify-center h-32 opacity-30">
                  <p className="text-xs font-black uppercase text-center tracking-[0.1em]">
                    NO_PARTICIPANTS
                  </p>
                </div>
              ) : (
                room.participants.map((participant) => {
                  const hasEditorAccess = room.editorsAccess.includes(participant._id);
                  return (
                    <div
                      key={participant._id}
                      className="border-3 border-[#1A1A1A] bg-white p-3 shadow-[4px_4px_0px_0px_#1A1A1A]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-[#1A1A1A] text-sm">{participant.username}</p>
                        </div>
                        <div
                          className={`px-2 py-1 text-[9px] font-black uppercase border-2 border-[#1A1A1A] ${
                            hasEditorAccess
                              ? 'bg-[#39FF14] text-[#1A1A1A]'
                              : 'bg-[#1A1A1A] text-white'
                          }`}
                        >
                          {hasEditorAccess ? '✓ EDITOR' : 'VIEWER'}
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex gap-1">
                        {!hasEditorAccess ? (
                          <button
                            onClick={() => manageEditorAccess(participant._id, 'grant')}
                            className="flex-1 border-3 border-[#1A1A1A] bg-[#39FF14] text-[#1A1A1A] px-2 py-1 font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_#1A1A1A] hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                          >
                            GRANT
                          </button>
                        ) : (
                          <button
                            onClick={() => manageEditorAccess(participant._id, 'revoke')}
                            className="flex-1 border-3 border-[#1A1A1A] bg-[#FF5722] text-white px-2 py-1 font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_#1A1A1A] hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                          >
                            REVOKE
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Lock Warning Dialog */}
        {showLockDialog && lockDialogInfo && (
          <LockWarningDialog
            username={lockDialogInfo.username}
            blockName={lockDialogInfo.blockId}
            onClose={() => setShowLockDialog(false)}
            onEditOther={() => {
              setShowLockDialog(false);
              // TODO: Find and move to next editable block
            }}
          />
        )}
      </div>
    </div>
  );
}
