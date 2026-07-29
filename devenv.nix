{ pkgs, ... }:

{
  packages = [ pkgs.biome ];
  languages = {
    javascript = {
      enable = true;
      pnpm.enable = true;
    };
    typescript.enable = true;
  };

}
