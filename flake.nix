{
  description = "Devshell for sewaddle";

  inputs = {
    nixpkgs.url      = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url  = "github:numtide/flake-utils";
    pyrin.url        = "github:nanoteck137/pyrin";
  };

  outputs = { self, nixpkgs, flake-utils, pyrin, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        app = pkgs.buildGoModule {
          pname = "sewaddle";
          version = self.shortRev or "dirty";
          src = ./.;

          vendorHash = "sha256-6kR1t22fJ0sLB2DjG+KdSN4mVD6n69c82zOonvfH3A8=";
        };
      in
      {
        packages.default = app;

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            go
            air
            pyrin.packages.${system}.default
          ];
        };
      }
    );
}
