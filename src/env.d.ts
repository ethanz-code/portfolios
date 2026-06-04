/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEPLOYED_AT?: string;
}

declare const process: {
  readonly env: {
    readonly DEPLOYED_AT?: string;
  };
};

interface Window {
  __modeIndicatorInit?: boolean;
}
