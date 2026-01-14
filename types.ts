
export enum PatchStatus {
  IDLE = 'IDLE',
  CHECKING = 'CHECKING',
  DOWNLOADING = 'DOWNLOADING',
  PATCHING = 'PATCHING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface PatchFile {
  id: number;
  name: string;
  size: number;
  type: 'GRF' | 'THOR' | 'DATA';
  version: string;
}

export interface PatcherConfig {
  gameName: string;
  clientName: string;
  mirrors: string[];
  grfPath: string;
  patchListUrl: string;
  ssoEnabled: boolean;
}

export interface PatchState {
  status: PatchStatus;
  currentFile: string | null;
  currentProgress: number;
  totalProgress: number;
  downloadSpeed: string;
  errorMessage: string | null;
  isReady: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: 'Update' | 'Event' | 'Notice';
  summary: string;
}
