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
          npmDepsHash = "sha256-IP3GP1JK8sEec8xTQdFgb5MH7B/IoX/nClTbR8u8lsA=";

          # postPatch = ''
          #   cp frontend/package-lock.json .
          # '';

          nativeBuildInputs = [pkgs.python39 pkgs.gcc pkgs.libtool_1_5];

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
