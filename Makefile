NODE_MODULES_BIN=./node_modules/.bin
TSC=$(NODE_MODULES_BIN)/tsc
ESBUILD=$(NODE_MODULES_BIN)/esbuild

SOURCES=$(wildcard src/**/*.ts)

OUTDIR=dist

.PHONY: clean

clean:
	rm -rf $(OUTDIR)

setup:
	@mkdir -p $(OUTDIR)

configs: tsconfig.json package.json package-lock.json

typescript: setup configs $(SOURCES)
	@$(TSC) --outdir $(OUTDIR)

test: typescript
	node $(OUTDIR)/tests/tests.js

run: typescript
	node $(OUTDIR)/subway.js

fixtures: fixtures/**/*.js
	$(ESBUILD) --bundle fixtures/a/index.js --outdir=fixtures/a/dist --minify --sourcemap
