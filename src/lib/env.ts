export function getEnvVar(name: string): string {
  const value = process.env[name]?.replace(/^["'](.+)["']$/, '$1');
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
