const DB_NAME = 'HabitTrackerDB';
const STORE_NAME = 'habits';
const DB_VERSION = 1;
import { Habit } from "../components/HabitCard";

let dbInstance: IDBDatabase | null = null;

const getDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Очищаем старые данные
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Добавляем все привычки
        habits.forEach(habit => {
          store.put(habit);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };
      };

      clearRequest.onerror = () => {
        console.error('Clear error:', clearRequest.error);
        reject(clearRequest.error);
      };
    });
  } catch (error) {
    console.error('Failed to save habits:', error);
    throw error;
  }
};

export const loadHabits = async (): Promise<Habit[]> => {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as Habit[] || []);
      request.onerror = () => {
        console.error('Load error:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load habits:', error);
    return []; // Возвращаем пустой массив при ошибке
  }
};
