{ ... }:

{
  treefmt.config.programs.biome.enable = true;
  languages = {
    javascript = {
      enable = true;
      pnpm.enable = true;
    };
    typescript.enable = true;
  };

}
