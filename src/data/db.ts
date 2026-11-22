/**
 * MEU LIVRO EM INSTANTE — CAMADA NATIVA DE INDEXEDDB
 * Suporta armazenamento de centenas de megabytes (imagens, matrizes de xilogravura, textos)
 * sem risco de estouro de cota (QuotaExceededError do localStorage).
 */

import { Project, Chapter, Character, AssetRecord, RevisionSnapshot } from './models';

const DB_NAME = 'MeuLivroEmInstanteDB';
const DB_VERSION = 2;

export class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  /**
   * Abre a conexão com o IndexedDB e cria os Object Stores e Índices necessários
   */
  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Tabela de Projetos
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('studioType', 'studioType', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 2. Tabela de Capítulos
        if (!db.objectStoreNames.contains('chapters')) {
          const store = db.createObjectStore('chapters', { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('order', 'order', { unique: false });
        }

        // 3. Tabela de Personagens
        if (!db.objectStoreNames.contains('characters')) {
          const store = db.createObjectStore('characters', { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
        }

        // 4. Tabela de Ativos Binários (Fotos, Xilogravuras, Capas)
        if (!db.objectStoreNames.contains('assets')) {
          const store = db.createObjectStore('assets', { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
        }

        // 5. Tabela de Revisões e Histórico de Versões
        if (!db.objectStoreNames.contains('revisions')) {
          const store = db.createObjectStore('revisions', { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * Operação genérica de leitura
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Operação genérica de listagem total
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Operação de gravação com substituição (Put)
   */
  async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Operação de exclusão por chave
   */
  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Consulta por índice secundário (ex.: todos os capítulos de um projeto)
   */
  async getAllByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(value);

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Estima o espaço em disco utilizado e disponível
   */
  async checkStorageQuota(): Promise<{ usageMB: number; quotaMB: number; percentUsed: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      return {
        usageMB: Math.round((usage / (1024 * 1024)) * 100) / 100,
        quotaMB: Math.round((quota / (1024 * 1024)) * 100) / 100,
        percentUsed: Math.round((usage / quota) * 100)
      };
    }
    return { usageMB: 0, quotaMB: 1000, percentUsed: 0 };
  }
}

export const dbStorage = new IndexedDBStorage();
