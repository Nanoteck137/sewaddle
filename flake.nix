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
        pkgs = import nixpkgs { inherit system; overlays = [ bp.overlays.default ]; };

        nodejs = pkgs.nodejs-18_x;
        node2nixOutput = import ./nix { inherit pkgs nodejs system; };

        nodeDeps = node2nixOutput.nodeDependencies;

        test = { var ? "" }: pkgs.buildNpmPackage {
          name = "sewaddle";
          version = "0.0.1";
          src = gitignore.lib.gitignoreSource ./.;
          npmBuild = "npm run build";

          extraEnvVars = {
            VITE_TEST = var;
          };

          # buildPhase = ''
          #   runHook preBuild
          #   ${npmBuild}
          #   runHook postBuild
          # '';

          installPhase = ''
            runHook preInstall
            cp -r dist $out/
            runHook postInstall
          '';
        };

      in with pkgs; {
        lib.test = test;
        devShells.default = mkShell { buildInputs = [ nodejs node2nix ]; };
      }
    );
}
