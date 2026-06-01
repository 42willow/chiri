{ pkgs }:

{
  caldav-xandikos = import ./xandikos.nix { inherit pkgs; };
  caldav-radicale = import ./radicale.nix { inherit pkgs; };
  caldav-baikal = import ./baikal.nix { inherit pkgs; };
  caldav-nextcloud = import ./nextcloud.nix { inherit pkgs; };
  caldav-rustical = import ./rustical.nix { inherit pkgs; };
}
