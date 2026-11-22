/**
 * MEU LIVRO EM INSTANTE — PONTO DE ENTRADA DO NÚCLEO EDITORIAL (CORE)
 */

// Camada de Dados e Persistência (IndexedDB)
export * from './data/models';
export * from './data/db';
export * from './data/ProjectRepository';

// Sanitização e Limpeza
export * from './core/sanitize/pasteSanitizer';

// Estúdio de Cordel e Métricas
export * from './core/cordel/metrics';

// Estúdio Gráfico, Capas e Código de Barras
export * from './core/graphics/woodcut';
export * from './core/graphics/spine';
export * from './core/graphics/coverComposer';
export * from './core/graphics/barcode';

// Revisor Gramatical Brasileiro
export * from './core/grammar/languagetool';

// Estúdio de Publicação e Exportação (EPUB 3)
export * from './core/export/epubCompiler';

// Estúdio Infantil e Juvenil
export * from './core/kids/characterManager';
export * from './core/kids/pictureBookLayout';

// Estúdio Jornalístico e Periódicos
export * from './core/journalism/newspaperGrid';

// Estúdio de Audiolivro e Leitura Automática ("Cria e Lê")
export * from './core/audio/audiobookEngine';
export * from './core/audio/autoReaderEngine';
