# Subway: Using feature flags to perform dead code elimination at the edge

### The problem

Lots of feature flags means lots of unused code throughout the codebase. If we assume that the average user has half of the experiments enabled, and that each variant of an experiment uses an equal amount of code, then half of the code behind feature flags is unused.

We could build all of these bundle variants at build time, but the *combinatorial explosion* of different combinations of feature flags means that the number of bundles we'd need to produce is enormous.

```math_formula
\prod^m_{j=0} v_j, m = \text{number of experiments}, v_j = \text{number of variants for experiment j}
```

For example, if we had 20 feature flags that each had two variants we would need to build

```math_formula
2^{20} = 1,048,576
```

Not only would this take an inordinate amount of time to build, but those bundles would also mostly go unused.

### A proposed solution

The number of possible sandwhiches at subway is huge. Pre-making all possible sandwhiches would be a huge waste, both in terms of time and sandwhiches that end up in the bin.

Instead of doing this, subway does *every possible thing* they can up to the point of making the sandwhich. The bread is baked, the fillings are prepped, the veggies are chopped. When a customer comes in to order a sandwhich the process is as fast as it possibly could be. They have picked an ideal point between *minimal pre-processing* and *minimal just-in-time processing.*

We can do something similar here. By doing enough

### Principles

1. **Do as little as possible at the edge.** Move as much out of the edge computation & into a build phase as possible. Examples:
   1. Finding the location of the “flags” code
   2. Finding all usages of the “flags” code
   3. Pre-computing each of the options for removal
   4. Pre-calculating the dependency graph of “parts” for dead code elimination
2. **Operate on minified source code.** There's no time to minify at the edge!
3. **Produce sane source maps.** This will be a nightmare to debug if the sourcemaps are broken

### Design

- Opportunity to strip code from bundles using feature flags
- Building a new bundle for each user would require building many bundles
- e.g. for 20 experiments with 2 variants each you would need to build `2^20= 1048576` bundles
- We have a lot more than 20 experiments!
- The “bundle space” is very sparse
- Options:
   - Build the N most common combinations of bundles
   - Do dead code elimination (DCE) at the edge
- DCE of source code is “easy”:
   - Operate on un-minified source code
   - Operate on un-bundled source code
   - Time constraints aren’t as strict
- DCE “at the edge” is much harder:
   - Need to operate on minified, bundled source (since there is no time to bundle + minify!)
- Source maps to the rescue?
   - Source maps are a function from output → source `f(sourcemap, output) → source code`
   - Apply transformations to source, use source map to find transformations for output?
- DCE approaches:
   - Process minified source into “parts”
   - Reference count parts
   - When a “part” is dropped, decrement the reference counter for another part
   - During the printing phase, don’t print parts with 0 references

```go
type PartID uint32

type Part struct {
  ID PartID
  References []PartID
  Code string
}

type Context struct {
  ReferenceCounts map[PartID]uint32
  Parts []Part
}

func (c *Context) drop(p *Part) {
  for referencedPart := range p.References {
    c.ReferenceCounts[referencedPart] -= 1
  }
}

func (c *Context) print() string {
  var printed string
  for p := range c.Parts {
    if c.ReferenceCounts[p.ID] > 0 {
      printed += p.Code
    }
  }
}
```

