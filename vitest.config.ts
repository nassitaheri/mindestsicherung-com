import { defineConfig } from 'vitest/config';

// Die Rechenlogik ist eine reine Funktion ohne DOM — node-Umgebung genügt.
// Getestet werden ausschließlich src/lib/**; die Astro-/Svelte-UI bleibt außen vor.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    // Golden-Master-Tests sollen sichtbar bleiben: it.todo/it.skip nicht verstecken.
    passWithNoTests: false,
  },
});
