run:
	air

clean:
	rm -rf work
	rm -rf tmp
	rm -f result

publish:
	nix build --no-link .#backend
	nix build --no-link .#frontend
	publish-version

.PHONY: run clean publish
