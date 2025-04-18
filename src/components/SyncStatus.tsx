import { useTaskStore } from '../store/taskStore';

export function SyncStatus() {
  const { pendingSyncs } = useTaskStore();
  
  return (
    <div className="fixed bottom-4 right-4">
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
        ${pendingSyncs > 0 
          ? 'bg-yellow-500 text-white animate-pulse' 
          : 'bg-green-500 text-white'}`}
      >
        {pendingSyncs > 0 ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
            Synchronisation en cours ({pendingSyncs})
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
            Synchronisé
          </>
        )}
      </div>
    </div>
  );
}