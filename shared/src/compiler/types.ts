export type ExportPreset = '1080p_h264' | '720p_h264';

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
