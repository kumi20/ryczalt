#!/usr/bin/env node

import { DocumentationAgent } from './documentation-agent.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const targetPath = args[0] || './src/app/**/*.ts';

// Znajdź wszystkie pliki TypeScript w podanej ścieżce
async function main() {
  try {
    const files = await glob(targetPath);

    for (const file of files) {
      try {
        DocumentationAgent.addDocumentation(file);
        console.log(`✓ Dodano dokumentację do: ${file}`);
      } catch (error) {
        console.error(`✗ Błąd podczas dodawania dokumentacji do ${file}:`, error);
      }
    }
  } catch (err) {
    console.error('Błąd podczas wyszukiwania plików:', err);
    process.exit(1);
  }
}

main();
