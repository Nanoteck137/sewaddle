{
  description = "Devshell for sewaddle";

  inputs = {
    nixpkgs.url      = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url  = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        version = pkgs.lib.strings.fileContents "${self}/version";
        fullVersion = ''${version}-${self.dirtyShortRev or self.shortRev or "dirty"}'';

        app = pkgs.buildGoModule {
          pname = "sewaddle";
          version = fullVersion;
          src = ./.;

          ldflags = [
            "-X github.com/nanoteck137/sewaddle/cmd.Version=${version}"
            "-X github.com/nanoteck137/sewaddle/cmd.Commit=${self.dirtyRev or self.rev or "no-commit"}"
          ];

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
          ];
        }; 
      }
    ) // {
      inherit self;

      nixosModules.default = { config, lib, pkgs, ... }:
        with lib; let
          cfg = config.services.sewaddle;

          sewaddleConfig = pkgs.writeText "config.toml" ''
            listen_addr = "${cfg.host}:${toString cfg.port}"
            data_dir = "/var/lib/sewaddle"
            library_dir = "${cfg.library}"
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

            host = mkOption {
              type = types.str;
              default = "";
              description = "hostname or address to listen on";
            };

            library = mkOption {
              type = types.path;
              description = lib.mdDoc "path to series library";
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
    };
}
