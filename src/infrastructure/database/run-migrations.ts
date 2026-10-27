
import { AppDataSource } from './data-source.js';

async function runMigrations(): Promise<void> {
  try {
    await AppDataSource.initialize();

    console.log('Conexão com PostgreSQL estabelecida.');

    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('Nenhuma migration pendente.');
    } else {
      for (const migration of migrations) {
        console.log(`Migration executada: ${migration.name}`);
      }
    }
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

await runMigrations();
