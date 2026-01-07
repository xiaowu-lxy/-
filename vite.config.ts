import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // 使用相对路径 './'，这样无论您把应用部署在 GitHub Pages 的子目录
    // 还是 Vercel 的根目录，它都能正常运行，不会出现白屏。
    base: './',
    // 允许在代码中使用 process.env.API_KEY
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
  };
});