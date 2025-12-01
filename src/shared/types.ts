export interface DOMLocator {
  startXPath: string;
  endXPath: string;
  startOffset: number;
  endOffset: number;
  textSnippet: string;
}

export interface Note {
  id: string;
  url: string;
  content: string;
  audioData?: string; // Base64 encoded audio
  domLocator: DOMLocator;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface StorageData {
  notes: Note[];
}

export interface MessagePayload {
  action: string;
  data?: any;
}
