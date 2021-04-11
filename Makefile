OUTDIR=dist
TSC=./node_modules/.bin/tsc

.PHONY: clean

clean:
	rm -rf $(OUTDIR)

setup:
	mkdir -p $(OUTDIR)

typescript: setup tsconfig.json package-lock.json package.json index.ts
	$(TSC) --outdir $(OUTDIR)

run: typescript
	node $(OUTDIR)/index.js
