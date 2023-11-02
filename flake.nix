{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bp.url = "github:serokell/nix-npm-buildpackage";
    bp.inputs.nixpkgs.follows = "nixpkgs";
    gitignore.url = "github:hercules-ci/gitignore.nix";
    gitignore.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, flake-utils, nixpkgs, bp, gitignore }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # pkgs = import nixpkgs { inherit system; overlays = [ bp.overlays.default ]; };
        pkgs = import nixpkgs { inherit system; };

        nodejs = pkgs.nodejs-18_x;
        node2nixOutput = import ./nix { inherit pkgs nodejs system; };

        nodeDeps = node2nixOutput.nodeDependencies;

        sewaddleFrontend = pkgs.buildNpmPackage {
          name = "sewaddle-frontend";
          version = "v0.0.1";
          src = gitignore.lib.gitignoreSource ./.;
          npmDepsHash = "sha256-j4YlPqoIgUsQMOodpyU8r71SIs5W8nxVTFXH7iMgQKE=";

          # postPatch = ''
          #   cp frontend/package-lock.json .
          # '';

          nativeBuildInputs = [pkgs.python39 pkgs.gcc pkgs.libtool pkgs.nodePackages_latest.node-gyp-build];

          CC = "${pkgs.gcc}/bin/gcc";

          buildPhase = ''
            runHook preBuild
            cd frontend
            npm run build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            cp -r frontend/dist $out/
            runHook postInstall
          '';
        };

      in with pkgs; {
        packages.default = sewaddleFrontend;
        devShells.default = mkShell { buildInputs = [ pkgs.yarn nodejs node2nix ]; };
      }
    );
}
