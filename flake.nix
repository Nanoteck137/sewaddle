{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bp.url = "github:serokell/nix-npm-buildpackage";
    bp.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, flake-utils, nixpkgs, bp }: 
    flake-utils.lib.eachDefaultSystem (system: 
      let 
        pkgs = import nixpkgs { inherit system; overlays = [ bp.overlays.default ]; };

        nodejs = pkgs.nodejs-18_x;
        node2nixOutput = import ./nix { inherit pkgs nodejs system; };

        nodeDeps = node2nixOutput.nodeDependencies;

        app = pkgs.buildNpmPackage {
          name = "sewaddle";
          version = "0.0.1";
          src = ./.;
          npmBuild = "npm run build";

          installPhase = ''
            runHook preInstall
            cp -r dist $out/
            runHook postInstall
          '';
        };

        # app = pkgs.stdenv.mkDerivation {
        #   name = "sewaddle";
        #   version = "0.0.1";
        #   src = ./.;
        #   buildInputs = [ nodejs ];
        #   buildPhase = ''
        #     runHook preBuild
        #     # symlink the generated node deps to the current directory for building
        #     ln -sf ${nodeDeps}/lib/node_modules ./node_modules
        #     export PATH="${nodeDeps}/bin:$PATH"
        #     npm run build
        #     runHook postBuild
        #   '';
        #   installPhase = ''
        #     runHook preInstall
        #     cp -r dist $out/
        #     runHook postInstall
        #   '';
        # };

        nginx = let
          in
          pkgs.dockerTools.buildLayeredImage {
            name = "sewaddle";
            tag = "latest";
            contents = [
              pkgs.caddy
              app
            ];

            extraCommands = ''
            '';

            config = {
              Cmd = [ "caddy" "file-server" "--listen" ":1337" "--root" "${app}" ];
              ExposedPorts = {
                "1337/tcp" = {};
              };
            };
          };
      in with pkgs; {
        packages.dockerImage = nginx;
        packages.default = app;
        devShells.default = mkShell { buildInputs = [ nodejs node2nix ]; };
      }
    );
}
