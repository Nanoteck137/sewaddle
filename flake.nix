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

          vendorHash = "sha256-r1+PKpWTAE+ZIcwjpc/Iodje4aSibllg/mQrCWT3Ors=";
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
