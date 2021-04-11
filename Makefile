OUTDIR=dist
NODE_MODULES_BIN=./node_modules/.bin
TSC=$(NODE_MODULES_BIN)/tsc
ESBUILD=$(NODE_MODULES_BIN)/esbuild

.PHONY: clean

clean:
	rm -rf $(OUTDIR)

setup:
	mkdir -p $(OUTDIR)

typescript: setup tsconfig.json package-lock.json package.json index.ts src/**/*.ts
	$(TSC) --outdir $(OUTDIR)

run: typescript
	node $(OUTDIR)/index.js

fixtures: fixtures/**/*.js
	$(ESBUILD) --bundle fixtures/a/index.js --outdir=fixtures/a/dist --minify --sourcemap
