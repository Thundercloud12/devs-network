export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F0EA] font-mono">
      <div className="animate-pulse border-4 border-[#1A1A1A] bg-[#39FF14] px-8 py-4 text-xl font-black uppercase tracking-widest text-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A]">
        INITIALIZING_SYSTEM...
      </div>
    </div>
  );
}
