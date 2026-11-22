/**
 * MEU LIVRO EM INSTANTE — REPOSITÓRIO CENTRAL DE PROJETOS
 * Gerencia persistência, migração automática do localStorage, e salvamento com debounce.
 */

import { Project, Chapter, Character, AssetRecord, RevisionSnapshot } from './models';
import { dbStorage } from './db';

export class ProjectRepository {
  private autoSaveTimers: Map<string, number> = new Map();

  /**
   * Salva ou atualiza um projeto completo no IndexedDB
   */
  async saveProject(project: Project): Promise<void> {
    project.updatedAt = new Date().toISOString();
    await dbStorage.put<Project>('projects', project);

    // Salva ou atualiza capítulos individualmente para consulta rápida
    if (project.chapters && project.chapters.length > 0) {
      for (const ch of project.chapters) {
        await dbStorage.put<Chapter>('chapters', ch);
      }
    }

    // Salva personagens se existirem
    if (project.characters && project.characters.length > 0) {
      for (const char of project.characters) {
        await dbStorage.put<Character>('characters', char);
      }
    }
  }

  /**
   * Recupera um projeto por ID
   */
  async getProject(id: string): Promise<Project | null> {
    const project = await dbStorage.get<Project>('projects', id);
    if (!project) return null;

    // Garante capítulos ordenados
    const chapters = await dbStorage.getAllByIndex<Chapter>('chapters', 'projectId', id);
    if (chapters && chapters.length > 0) {
      project.chapters = chapters.sort((a, b) => a.order - b.order);
    }

    // Recupera personagens associados
    const characters = await dbStorage.getAllByIndex<Character>('characters', 'projectId', id);
    if (characters && characters.length > 0) {
      project.characters = characters;
    }

    return project;
  }

  /**
   * Lista todos os projetos salvos
   */
  async listProjects(): Promise<Project[]> {
    const projects = await dbStorage.getAll<Project>('projects');
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Exclusão controlada de projeto e todos os seus vínculos
   */
  async deleteProject(id: string): Promise<void> {
    await dbStorage.delete('projects', id);

    // Remove capítulos órfãos
    const chapters = await dbStorage.getAllByIndex<Chapter>('chapters', 'projectId', id);
    for (const ch of chapters) {
      await dbStorage.delete('chapters', ch.id);
    }

    // Remove personagens órfãos
    const characters = await dbStorage.getAllByIndex<Character>('characters', 'projectId', id);
    for (const char of characters) {
      await dbStorage.delete('characters', char.id);
    }

    // Remove ativos associados
    const assets = await dbStorage.getAllByIndex<AssetRecord>('assets', 'projectId', id);
    for (const asset of assets) {
      await dbStorage.delete('assets', asset.id);
    }
  }

  /**
   * Cria um snapshot de revisão para histórico e recuperação de versão
   */
  async createRevision(projectId: string, summary: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const revision: RevisionSnapshot = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      projectId,
      timestamp: new Date().toISOString(),
      summary,
      dataSnapshotJson: JSON.stringify(project)
    };

    await dbStorage.put<RevisionSnapshot>('revisions', revision);
  }

  /**
   * Restaura um snapshot de versão anterior
   */
  async restoreRevision(revisionId: string): Promise<Project | null> {
    const rev = await dbStorage.get<RevisionSnapshot>('revisions', revisionId);
    if (!rev) return null;

    const project: Project = JSON.parse(rev.dataSnapshotJson);
    await this.saveProject(project);
    return project;
  }

  /**
   * Salvamento automático inteligente com debounce (1000ms)
   */
  scheduleAutoSave(
    project: Project,
    onStatusChange?: (status: 'digitando' | 'salvando' | 'salvo') => void
  ): void {
    if (onStatusChange) onStatusChange('digitando');

    // Cancela temporizador anterior
    const existing = this.autoSaveTimers.get(project.id);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = window.setTimeout(async () => {
      if (onStatusChange) onStatusChange('salvando');
      try {
        await this.saveProject(project);
        if (onStatusChange) onStatusChange('salvo');
      } catch (error) {
        console.error('Erro no salvamento automático IndexedDB:', error);
      } finally {
        this.autoSaveTimers.delete(project.id);
      }
    }, 1000);

    this.autoSaveTimers.set(project.id, timer);
  }

  /**
   * Migração transparente do armazenamento legado (localStorage -> IndexedDB)
   */
  async migrateFromLocalStorage(): Promise<number> {
    const LEGACY_KEY = 'meulivro_projects_v1';
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return 0;

    try {
      const legacyProjects = JSON.parse(raw);
      if (!Array.isArray(legacyProjects)) return 0;

      let migratedCount = 0;
      for (const lp of legacyProjects) {
        // Verifica se já existe no IndexedDB
        const exists = await dbStorage.get<Project>('projects', lp.id);
        if (!exists) {
          const modernProject: Project = {
            id: lp.id || 'proj_' + Date.now(),
            title: lp.title || 'Sem título',
            subtitle: lp.subtitle || '',
            author: lp.author || 'Autor anônimo',
            studioType: this.mapLegacyTypeToStudio(lp.type),
            format: (lp.format || '14x21') as any,
            geometry: {
              widthMm: 140,
              heightMm: 210,
              marginTopMm: 20,
              marginBottomMm: 20,
              marginInsideMm: 22,
              marginOutsideMm: 18,
              bleedMm: 3,
              columnsCount: 1,
              gutterMm: 0
            },
            typography: {
              fontFamily: lp.fontFamily || 'Georgia',
              bodyFontSizePt: Number(lp.fontSize) || 11,
              lineHeight: 1.45,
              paragraphIndentMm: 6,
              hyphenation: true
            },
            chapters: (lp.chapters || []).map((ch: any, idx: number) => ({
              id: ch.id || 'ch_' + idx,
              projectId: lp.id,
              order: idx + 1,
              title: ch.title || `Capítulo ${idx + 1}`,
              contentHtml: ch.contentHtml || ch.text || '<p></p>'
            })),
            createdAt: lp.createdAt || new Date().toISOString(),
            updatedAt: lp.updatedAt || new Date().toISOString(),
            schemaVersion: 2
          };

          await this.saveProject(modernProject);
          migratedCount++;
        }
      }

      console.log(`[Migração] ${migratedCount} projetos migrados com sucesso do localStorage para o IndexedDB.`);
      return migratedCount;
    } catch (err) {
      console.warn('[Migração] Falha ao processar localStorage legado:', err);
      return 0;
    }
  }

  private mapLegacyTypeToStudio(legacyType?: string): any {
    switch (legacyType?.toLowerCase()) {
      case 'cordel':
        return 'cordel';
      case 'revista':
      case 'jornal':
        return 'journalism';
      case 'infantil':
        return 'kids_ya';
      default:
        return 'literary';
    }
  }
}

export const projectRepository = new ProjectRepository();
