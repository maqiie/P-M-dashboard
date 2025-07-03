import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite to always serve index.html for all routes
    historyApiFallback: true,
  },
});
