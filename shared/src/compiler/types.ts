export type { ExportPreset } from '../schemas/render.schema.js';

export interface PresetConfig {
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  crf: number;
}

export interface CompilerOutput {
  inputs: string[];
  filterComplex: string;
  outputOptions: string[];
}
