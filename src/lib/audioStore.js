export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("WorkingLedgerAudioDB", 1);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("songs")) {
        db.createObjectStore("songs", { keyPath: "id" });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSong(file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["songs"], "readwrite");
    const store = transaction.objectStore("songs");
    
    const song = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      data: file, // File/Blob
      createdAt: new Date().toISOString()
    };
    
    const request = store.add(song);
    request.onsuccess = () => resolve(song);
    request.onerror = () => reject(request.error);
  });
}

export async function getSongs() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["songs"], "readonly");
    const store = transaction.objectStore("songs");
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSong(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["songs"], "readwrite");
    const store = transaction.objectStore("songs");
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
