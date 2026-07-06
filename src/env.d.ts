/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly GISCUS_REPO?: string;
  readonly GISCUS_REPO_ID?: string;
  readonly GISCUS_CATEGORY?: string;
  readonly GISCUS_CATEGORY_ID?: string;
  readonly FORMSPREE_ENDPOINT?: string;
  readonly BUTTONDOWN_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
