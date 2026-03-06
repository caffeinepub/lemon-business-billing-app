// IndexedDB-based offline queue for mutations that need to sync when back online

export type OfflineOperationType =
  | "addCustomer"
  | "addTransaction"
  | "payCreditDue";

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  payload: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

const DB_NAME = "lemon-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "operations";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function enqueueOperation(
  type: OfflineOperationType,
  payload: Record<string, unknown>,
): Promise<OfflineOperation> {
  const operation: OfflineOperation = {
    id: generateId(),
    type,
    payload,
    timestamp: Date.now(),
    synced: false,
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(operation);
      req.onsuccess = () => resolve(operation);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn("[OfflineQueue] Failed to enqueue operation:", err);
    return operation;
  }
}

export async function getPendingOperations(): Promise<OfflineOperation[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("synced");
      const req = index.getAll(IDBKeyRange.only(false));
      req.onsuccess = () => {
        const results = (req.result as OfflineOperation[]).sort(
          (a, b) => a.timestamp - b.timestamp,
        );
        resolve(results);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn("[OfflineQueue] Failed to get pending operations:", err);
    return [];
  }
}

export async function removeOperation(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn("[OfflineQueue] Failed to remove operation:", err);
  }
}

export async function getPendingCount(): Promise<number> {
  const ops = await getPendingOperations();
  return ops.length;
}

export async function clearAllOperations(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn("[OfflineQueue] Failed to clear operations:", err);
  }
}
