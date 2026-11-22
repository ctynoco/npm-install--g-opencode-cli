/**
 * MEU LIVRO EM INSTANTE — MODELOS DE DADOS DA PLATAFORMA
 * Definições de tipos TypeScript em conformidade com MODELO_DE_DADOS.md
 */

export type StudioType =
  | 'literary'      // Estúdio Literário (Livros, Poesias, Contos, Biografias)
  | 'kids_ya'       // Estúdio Infantil e Juvenil (Histórias, Personagens, Spreads)
  | 'cordel'        // Estúdio de Cordel (Versos, Métricas, Rimas, Xilogravuras)
  | 'journalism'    // Estúdio Jornalístico (Jornais, Revistas, Grids Multicolunares)
  | 'graphic'       // Estúdio Gráfico (Capas Abertas, Lombadas, Imposição)
  | 'publishing';   // Estúdio de Publicação (PDF Gráfico, EPUB 3, Audiolivro)

export type PageFormat =
  | 'a5'            // 148 x 210 mm
  | '14x21'         // Livro Padrão Brasil (140 x 210 mm)
  | '16x23'         // Livro Expandido (160 x 230 mm)
  | '17x24'         // Livro Técnico (170 x 240 mm)
  | 'a4'            // 210 x 297 mm
  | 'cordel_padrao' // 105 x 150 mm
  | 'cordel_medio'  // 135 x 180 mm
  | 'custom';

export interface PageGeometry {
  widthMm: number;
  heightMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginInsideMm: number;   // Margem da canaleta de encadernação
  marginOutsideMm: number;  // Margem externa
  bleedMm: number;          // Sangria gráfica (3 a 5 mm)
  columnsCount: number;     // 1 para livros, 2 a 4 para jornais
  gutterMm: number;         // Espaço entre colunas
}

export interface Footnote {
  id: string;
  number: number;
  text: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  order: number;
  title: string;
  contentHtml: string;
  footnotes?: Footnote[];
  newspaperMeta?: {
    kicker?: string;        // Chapéu jornalístico
    lead?: string;          // Linha-fina
    byline?: string;        // Assinatura do autor
    columnSpan?: number;
  };
  cordelMeta?: {
    stanzaType: 'quadra' | 'sextilha' | 'septilha' | 'oitava' | 'decima';
    rhymeScheme: string;
    verifiedMeter: boolean;
  };
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  ageGroup: 'infantil' | 'adolescente' | 'adulto';
  role: 'protagonista' | 'antagonista' | 'coadjuvante' | 'mentor';
  visualTraits: {
    hair: string;
    eyes: string;
    clothing: string;
    distinctiveFeatures: string;
  };
  psychologicalTraits: string[];
  backstory: string;
  avatarAssetId?: string;
}

export interface CoverDesign {
  id: string;
  projectId: string;
  paperType: 'polen_bold_90' | 'polen_soft_80' | 'offset_75' | 'couche_115';
  totalPageCount: number;
  calculatedSpineWidthMm: number;
  frontCover: {
    title: string;
    subtitle?: string;
    author: string;
    backgroundImageAssetId?: string;
    woodcutOverlayAssetId?: string;
    textColor: string;
    bgColor: string;
  };
  spine: {
    text: string;
    direction: 'horizontal' | 'vertical_down';
    showAuthor: boolean;
  };
  backCover: {
    synopsis: string;
    barcodeIsbn?: string;
    publisherLogoAssetId?: string;
    authorBio?: string;
  };
}

export interface AssetRecord {
  id: string;
  projectId: string;
  name: string;
  mimeType: string;
  byteSize: number;
  data: Blob | ArrayBuffer | string; // Suporta Blob no IndexedDB
  createdAt: string;
}

export interface RevisionSnapshot {
  id: string;
  projectId: string;
  timestamp: string;
  summary: string;
  dataSnapshotJson: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  coauthors?: string[];
  edition?: string;
  year?: number;
  isbn?: string;
  studioType: StudioType;
  format: PageFormat;
  geometry: PageGeometry;
  typography: {
    fontFamily: string;
    bodyFontSizePt: number;
    lineHeight: number;
    paragraphIndentMm: number;
    hyphenation: boolean;
  };
  chapters: Chapter[];
  characters?: Character[];
  coverDesign?: CoverDesign;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}
