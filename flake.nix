{
  description = "Chiri - a cross-platform CalDAV task management app. Currently in very early alpha!";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      rust-overlay,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
          # temporary until my pr in nixos/nixpkgs is merged which unbreaks nsis on darwin
          config.allowBrokenPredicate = pkg: nixpkgs.lib.getName pkg == "nsis";
        };
      in
      {
        packages = import ./nix/packages {
          inherit pkgs;
          src = ./.;
        };

        apps = import ./nix/apps/caldav-servers { inherit pkgs; };

        devShells = {
          default = import ./nix/shell.nix { inherit pkgs; };
        };
      }
    );
}
