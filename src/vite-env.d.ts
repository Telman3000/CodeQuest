/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of deployed `server/` (no trailing slash), e.g. https://your-api.example.com */
  readonly VITE_AI_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
