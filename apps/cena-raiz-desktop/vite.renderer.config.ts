import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// O dev server vigia a raiz do projeto, que tambem guarda saida de build e os
// runtimes preparados: `out/` (copia empacotada), `.runtime-cache/` (fonte e
// build do FFmpeg) e `resources/runtimes/` (Python/WhisperX e binarios). Sao
// dezenas de milhares de arquivos, e os .html que existem dentro deles
// (matplotlib, idlelib, torch) disparavam page reload do renderer sem que
// nenhum codigo-fonte tivesse mudado. Nada disso e fonte: nao deve ser vigiado.
// O Vite mantem seus proprios ignores (.git, node_modules) alem destes.
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/out/**', '**/.runtime-cache/**', '**/resources/runtimes/**'],
    },
  },
});
