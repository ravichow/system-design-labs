export type NavTab = 'learn' | 'practice' | 'lab' | 'cheatsheets';

export type ChapterTone = 'setup' | 'problem' | 'solution' | 'technique' | 'tradeoff' | 'insight' | 'recap';

export interface ModuleInfo {
  id: string;
  num: string;
  title: string;
  color: string;
  lessons: LessonMeta[];
}

export interface LessonMeta {
  id: string;
  title: string;
  ready?: boolean;
}

export interface TagInfo {
  text: string;
  tone?: 'amber' | 'green' | 'red' | 'violet' | 'paper' | 'gray' | 'blue' | 'teal' | 'rose';
  icon?: string;
}

export interface IsoEntity {
  id?: string;
  type?: 'block' | 'db' | 'crowd' | 'panel' | 'zone' | 'queue';
  x: number;
  y: number;
  s?: number; // size
  h?: number; // height
  color?: string;
  glyph?: string;
  label?: string | string[];
  sub?: string;
  heat?: number;
  dead?: number;
  dim?: number;
  opacity?: number;
  lift?: number;
  cpu?: number;
  tags?: TagInfo[];
  radius?: number;
  pills?: 'above' | 'below';
  labelFade?: number;
}

export interface IsoLink {
  from?: string;
  to?: string;
  pts: [number, number][];
  heads?: 'end' | 'both' | 'none';
  color?: string;
  label?: string;
  dashed?: boolean;
}

export interface IsoFlow {
  route: string[];
  kind?: 'req' | 'res' | 'ping';
  bounce?: boolean;
  rate?: number;
  color?: string;
}

export interface SceneGraph {
  entities: Record<string, IsoEntity>;
  links: Record<string, IsoLink>;
  flows: IsoFlow[];
}

export interface StepCallout {
  kind: 'insight' | 'tip' | 'warn';
  text: string;
}

export interface StepMetrics {
  dns?: number | null;
  connect?: number | null;
  request?: number | null;
  download?: number | null;
  total?: number | null;
  [key: string]: number | null | undefined;
}

export interface LessonStep {
  short: string;
  chapter: ChapterTone;
  title: string;
  body: string[];
  callout?: StepCallout;
  changes?: string[];
  metrics?: StepMetrics;
  scene: SceneGraph;
}

export interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  minutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  metrics: string[];
  goals?: { text: string; step: number }[];
  steps: LessonStep[];
}

export interface QuizScenario {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  scenario: string;
  metricsGiven?: Record<string, string>;
  options: {
    id: string;
    text: string;
    tradeoff: string;
  }[];
  correctId: string;
  explanation: string;
  architectureInsight: string;
}

export interface MathChallenge {
  id: string;
  title: string;
  problem: string;
  variables: { name: string; val: string; desc: string }[];
  question: string;
  unit: string;
  correctAnswer: number;
  tolerancePct: number;
  formula: string;
  explanation: string;
}

export interface LabComponentDef {
  type: string;
  name: string;
  icon: string;
  color: string;
  defaultLabel: string;
  glyph: string;
  category: 'client' | 'network' | 'compute' | 'storage' | 'queue';
  baseLatency: number;
  maxRps: number;
}
