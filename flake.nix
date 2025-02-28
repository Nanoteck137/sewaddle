{
  description = "Devshell for sewaddle";

  inputs = {
    nixpkgs.url      = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url  = "github:numtide/flake-utils";

    gitignore.url = "github:hercules-ci/gitignore.nix";
    gitignore.inputs.nixpkgs.follows = "nixpkgs";

    devtools.url     = "github:nanoteck137/devtools";
    devtools.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils, gitignore, devtools, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        version = pkgs.lib.strings.fileContents "${self}/version";
        fullVersion = ''${version}-${self.dirtyShortRev or self.shortRev or "dirty"}'';

        backend = pkgs.buildGoModule {
          pname = "sewaddle";
          version = fullVersion;
          src = ./.;
          subPackages = ["cmd/sewaddle" "cmd/sewaddle-cli"];

          ldflags = [
            "-X github.com/nanoteck137/sewaddle/cmd.Version=${version}"
            "-X github.com/nanoteck137/sewaddle/cmd.Commit=${self.dirtyRev or self.rev or "no-commit"}"
          ];

          vendorHash = "sha256-wulRRQi0VVVwIpgHphof1ewTDByJ3CIhp3IQIjXRtq8=";

          nativeBuildInputs = [ pkgs.makeWrapper ];

          postFixup = ''
            wrapProgram $out/bin/sewaddle --prefix PATH : ${pkgs.lib.makeBinPath [ pkgs.imagemagick ]}
            wrapProgram $out/bin/sewaddle-cli --prefix PATH : ${pkgs.lib.makeBinPath [ pkgs.imagemagick ]}
          '';
        };

        frontend = pkgs.buildNpmPackage {
          name = "sewaddle-web";
          version = fullVersion;

          src = gitignore.lib.gitignoreSource ./web;
          npmDepsHash = "sha256-/baraTJgtvMKrA5cm2q+u2alPM1stPawXsUH5AZrwMU=";

          PUBLIC_VERSION=version;
          PUBLIC_COMMIT=self.rev or "dirty";

          installPhase = ''
            runHook preInstall
            cp -r build $out/
            echo '{ "type": "module" }' > $out/package.json

            mkdir $out/bin
            echo -e "#!${pkgs.runtimeShell}\n${pkgs.nodejs}/bin/node $out\n" > $out/bin/sewaddle-web
            chmod +x $out/bin/sewaddle-web

            runHook postInstall
          '';
        };

        tools = devtools.packages.${system};
      in
      {
        packages = {
          default = backend;
          inherit backend frontend;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            air
            go
            gopls
            nodejs
            imagemagick

            tools.publishVersion
          ];
        }; 
      }
    ) // {
      nixosModules.default = import ./nix/backend.nix { inherit self; };
      nixosModules.frontend = import ./nix/frontend.nix { inherit self; };
    };
}
