{
  description = "Chiri - a cross-platform CalDAV task management app. Currently in very early alpha!";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      rust-overlay,
      ...
    }:
    let
      lib = nixpkgs.lib;

      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];

      forAllSystems = function: lib.genAttrs systems (system: function (pkgsFor system));

      pkgsFor =
        system:
        import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
          # temporary until my pr in nixos/nixpkgs is merged which unbreaks nsis on darwin
          config.allowBrokenPredicate = pkg: nixpkgs.lib.getName pkg == "nsis";
        };
    in
    {
      packages = forAllSystems (
        pkgs:
        import ./nix/packages {
          inherit pkgs;
          src = ./.;
        }
      );

      apps = forAllSystems (pkgs: import ./nix/apps/caldav-servers { inherit pkgs; });

      devShells = forAllSystems (
        pkgs:
        {
          default = import ./nix/shell.nix { inherit pkgs; };
        }
      );

      formatter = forAllSystems (pkgs: pkgs.nixfmt);
    };
}
