interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export const PORT = (() => {
  const port = Number(process.env.PORT) || 3000;
  if (isNaN(port) || port <= 0) {
    throw new Error('PORT deve ser um número válido maior que 0');
  }
  return port;
})();

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DB_CONFIG: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: (() => {
    const port = parseInt(process.env.DB_PORT || '5432');
    if (isNaN(port) || port <= 0) {
      throw new Error('DB_PORT deve ser um número válido maior que 0');
    }
    return port;
  })(),
  database: process.env.DB_NAME || 'zentech',
  username: process.env.DB_USER || 'postgres',
  password: (() => {
    const pass = process.env.DB_PASSWORD;
    if (!pass && NODE_ENV === 'production') {
      throw new Error('DB_PASSWORD é obrigatório em ambiente de produção');
    }
    return pass || 'dev_password_only';
  })()
};

if (NODE_ENV === 'production') {
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST é obrigatório em produção');
  }
  if (!process.env.DB_NAME) {
    throw new Error('DB_NAME é obrigatório em produção');
  }
  if (!process.env.DB_USER) {
    throw new Error('DB_USER é obrigatório em produção');
  }
}