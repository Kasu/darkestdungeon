export class BuildOptions {
  constructor (
    public outputFolder: string = 'dist',
    public environment: string = 'development',
    public i18nVersion: string = 'latest',

    // Optional features.
    public index: boolean = false,
    public sourceMaps = false,
    public debug: boolean = false,
    public cache: boolean = false,
    public hmr: boolean = false,
    public compress: boolean = false,
    public minify: boolean = false,
    public analyzeBundles: boolean = false,
    public stats: boolean = false,
    public manifest: boolean = false,
    public vendor: boolean = false
  ) {}
}

export class BuildInjects {
  constructor (
    public apiServerBaseUrl: string = ''
  ) {}
}
