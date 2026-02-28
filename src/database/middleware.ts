import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource, createDataSource } from './connection';

let dataSource = AppDataSource;

async function isConnectionAlive(): Promise<boolean> {
  try {
    await dataSource.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}


async function reinitialize(): Promise<void> {
  try { await dataSource.destroy(); } catch { /* already gone */ }
  dataSource = createDataSource();
  await dataSource.initialize();
  console.log('✅ Database re-initialized');
}


export async function ensureDatabase() {
  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize();
      console.log('✅ Database initialized');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
    return dataSource;
  }

  const alive = await isConnectionAlive();
  if (!alive) {
    console.warn('⚠️  Database connection lost — reconnecting...');
    await reinitialize();
  }

  return dataSource;
}

export async function getDataSource() {
  return ensureDatabase();
}

export async function withDatabase<T>(
  callback: (ds: DataSource) => Promise<T>
): Promise<T> {
  const ds = await ensureDatabase();
  return callback(ds);
}
