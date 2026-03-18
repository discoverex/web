const DB_NAME = 'ModelCacheDB';
const STORE_NAME = 'models';

/**
 * IndexedDB를 이용한 모델 캐싱 유틸리티
 */
export const modelCache = {
  async openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'modelName' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 로컬에 저장된 유효한 모델이 있는지 확인
   * @param modelName 모델 파일명
   * @param serverVersion 서버에서 받은 버전/해시값
   */
  async getValidModel(modelName: string, serverVersion: string): Promise<ArrayBuffer | null> {
    const db = await this.openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(modelName);

      request.onsuccess = () => {
        const record = request.result;
        // 버전이 일치할 때만 데이터를 반환 (갱신 로직의 핵심)
        resolve(record && record.version === serverVersion ? record.data : null);
      };
      request.onerror = () => resolve(null);
    });
  },

  /**
   * 모델 데이터를 로컬에 저장 (갱신 포함)
   */
  async saveModel(modelName: string, version: string, data: ArrayBuffer) {
    const db = await this.openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({
      modelName,
      version,
      data,
      updatedAt: Date.now(),
    });
  },
};
