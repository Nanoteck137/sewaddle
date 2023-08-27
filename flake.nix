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

        sewaddle = pkgs.buildNpmPackage {
          name = "sewaddle";
          version = "v0.0.1";
          src = gitignore.lib.gitignoreSource ./.;
          npmDepsHash = "sha256-hkjrbH1zuaNKsvcQqCWjrMKTGRg9LyGvL+8oVGBApbI=";
  
          VITE_TEST = "";

          buildPhase = ''
            runHook preBuild
            npm run build
            runHook postBuild
          '';
        
          installPhase = ''
            runHook preInstall
            cp -r dist $out/
            runHook postInstall
          '';
        };

      in with pkgs; {
        packages.default = sewaddle;
        devShells.default = mkShell { buildInputs = [ pkgs.yarn nodejs node2nix ]; };
      }
    );
}
