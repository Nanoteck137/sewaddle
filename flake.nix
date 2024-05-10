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

        version = pkgs.lib.strings.fileContents "${self}/version";
        fullVersion = ''${version}-${self.shortRev or "dirty"}'';

        app = pkgs.buildGoModule {
          pname = "sewaddle";
          version = fullVersion;
          src = ./.;

          vendorHash = "sha256-6kR1t22fJ0sLB2DjG+KdSN4mVD6n69c82zOonvfH3A8=";
        };

        dockerImage = pkgs.dockerTools.buildLayeredImage {
          name = "sewaddle";
          tag = version;
          config = {
            Env = [
              "SEWADDLE_DATA_DIR=/data"
              "SEWADDLE_LIBRARY_DIR=/library"
            ];
            Entrypoint = ["${app}/bin/sewaddle"];
            Cmd = [ "serve" ];
            ExposedPorts = {
              "3000/tcp" = {};
            };
          };
        };
      in
      {
        packages.default = app;
        packages.dockerImage = dockerImage;

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            go
            air
            pyrin.packages.${system}.default
          ];
        };

        nixosModules.default = { config, lib, pkgs, ... }:
          with lib;
        let
          cfg = config.services.sewaddle;

          sewaddleConfig = pkgs.writeText "config.toml" ''
            listen_addr = ":${toString cfg.port}"
            data_dir = "/var/lib/sewaddle"
            library_dir = "/var/lib/sewaddle/library"
          '';
        in
        {
          options.services.sewaddle = {
            enable = mkEnableOption "Enable the Sewaddle service";

            port = mkOption {
              type = types.port;
              default = 3000;
              description = "port to listen on";
            };

            package = mkOption {
              type = types.package;
              default = self.packages.${pkgs.system}.default;
              description = "package to use for this service (defaults to the one in the flake)";
            };
            
            user = mkOption {
              type = types.str;
              default = "sewaddle";
              description = lib.mdDoc "user to use for this service";
            };

            group = mkOption {
              type = types.str;
              default = "sewaddle";
              description = lib.mdDoc "group to use for this service";
            };

          };

          config = mkIf cfg.enable {
            systemd.services.sewaddle = {
              description = "Sewaddle";
              wantedBy = [ "multi-user.target" ];

              serviceConfig = {
                User = cfg.user;
                Group = cfg.group;

                StateDirectory = "sewaddle";

                ExecStart = "${cfg.package}/bin/sewaddle serve -c '${sewaddleConfig}'";

                Restart = "on-failure";
                RestartSec = "5s";

                ProtectHome = true;
                ProtectHostname = true;
                ProtectKernelLogs = true;
                ProtectKernelModules = true;
                ProtectKernelTunables = true;
                ProtectProc = "invisible";
                ProtectSystem = "strict";
                RestrictAddressFamilies = [ "AF_INET" "AF_INET6" "AF_UNIX" ];
                RestrictNamespaces = true;
                RestrictRealtime = true;
                RestrictSUIDSGID = true;
              };
            };

            users.users = mkIf (cfg.user == "sewaddle") {
              sewaddle = {
                group = cfg.group;
                isSystemUser = true;
              };
            };

            users.groups = mkIf (cfg.group == "sewaddle") {
              sewaddle = {};
            };
          };
        };
      }
    );
}
