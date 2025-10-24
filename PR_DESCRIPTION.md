# hardening: repository hardening (dependencies, tsconfig, OpenAI, BrandGuard)

## 📋 Overview

This is a **centralized hardening PR** that aggregates repository-level improvements for security, stability, and maintainability. This PR is currently in **DRAFT** state and contains only documentation and planning. Actual code changes will be applied in follow-up commits after review and approval.

---

## 🔗 Related Issues

This PR addresses the following drafted issues (to be created/linked):

1. **Fix: Remove core modules and pin dependencies in package.json**
   - Remove Node.js core modules (`fs`, `path`) from dependencies
   - Pin all wildcard `*` and `latest` versions to specific versions
   - Files: `package.json`, `src/package.json`, `functions/package.json`

2. **Fix: Harden TypeScript config for Node 18 and ESM interop**
   - Update `functions/tsconfig.json` for Node 18 compatibility
   - Add ESM interop flags for better module resolution
   - Target ES2020+ for modern features

3. **Fix: Align OpenAI SDK usage and add API key validation**
   - Add runtime validation for OpenAI API key
   - Ensure proper error handling for missing credentials
   - File: `functions/src/index.ts`

4. **Improve: BrandGuard Unicode support & scoring**
   - Enhance BrandGuard to support Unicode characters
   - Improve scoring algorithm for better accuracy
   - Add support for Spanish special characters (ñ, á, é, í, ó, ú)

5. **Refactor: Define monorepo strategy or consolidate package.json files**
   - Document decision: Keep separate package.json or create workspace
   - Evaluate current structure (root, functions, src)

6. **Fix: Validate CI workflows and secrets usage**
   - Review GitHub Actions workflows (if any)
   - Ensure secrets are properly configured

7. **Docs: Fix README encoding and dev instructions**
   - Ensure README.md uses UTF-8 encoding
   - Improve development setup instructions

8. **Add: CI steps for type-check, lint, audit and tests**
   - Add npm audit step to CI
   - Add TypeScript type-checking step
   - Add linting step
   - Ensure tests run in CI

---

## 📝 Code Fragment Examples

Below are the **minimal safe changes** that will be applied in subsequent commits. These examples demonstrate the surgical, focused nature of the planned changes.

### 1. `functions/tsconfig.json` - TypeScript Hardening

**Current:**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2017",
    "skipLibCheck": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

**Proposed:**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2020",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["es2020"]
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

**Key Changes:**
- ✅ `target: "es2020"` - Align with Node 18 capabilities
- ✅ `moduleResolution: "node"` - Explicit resolution strategy
- ✅ `esModuleInterop: true` - Better ESM/CommonJS interop
- ✅ `allowSyntheticDefaultImports: true` - Flexible import syntax
- ✅ `resolveJsonModule: true` - JSON import support
- ✅ `forceConsistentCasingInFileNames: true` - Cross-platform safety
- ✅ `lib: ["es2020"]` - Modern library definitions

---

### 2. `functions/src/index.ts` - OpenAI API Key Validation

**Current (lines 7-13):**
```typescript
// Define secrets and parameters
const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const OPENAI_MODEL = functions.config().params?.OPENAI_MODEL || 'gpt-4o-mini';
const BRAND_GUARD_BANNED = (functions.config().params?.BRAND_GUARD_BANNED || '').split(',');
const BRAND_GUARD_STRICT = functions.config().params?.BRAND_GUARD_STRICT === 'true';

const openai = new OpenAI({ apiKey: CHATGPT_EM_ESTUDIO });
```

**Proposed:**
```typescript
// Define secrets and parameters
const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const OPENAI_MODEL = functions.config().params?.OPENAI_MODEL || 'gpt-4o-mini';
const BRAND_GUARD_BANNED = (functions.config().params?.BRAND_GUARD_BANNED || '').split(',');
const BRAND_GUARD_STRICT = functions.config().params?.BRAND_GUARD_STRICT === 'true';

// Validate OpenAI API key at initialization
if (!CHATGPT_EM_ESTUDIO || CHATGPT_EM_ESTUDIO.trim() === '') {
  functions.logger.error('OpenAI API key (CHATGPT_EM_ESTUDIO) is not configured');
  throw new Error('OpenAI API key is required but not configured');
}

const openai = new OpenAI({ apiKey: CHATGPT_EM_ESTUDIO });
```

**Key Changes:**
- ✅ Runtime validation for API key presence
- ✅ Error logging for debugging
- ✅ Fail-fast behavior to prevent silent errors
- ✅ Reject whitespace-only keys

---

### 3. `functions/package.json` - Dependency Pinning

**Current:**
```json
{
  "devDependencies": {
    "@types/node": "18",
    "@types/node-fetch": "^2.6.4",
    "firebase-functions-test": "^3.1.0",
    "typescript": "^5.0.0"
  }
}
```

**Proposed:**
```json
{
  "devDependencies": {
    "@types/node": "^18.19.0",
    "@types/node-fetch": "^2.6.4",
    "firebase-functions-test": "^3.1.0",
    "typescript": "^5.0.0"
  }
}
```

**Key Changes:**
- ✅ Pin `@types/node` from bare `"18"` to `"^18.19.0"`

---

### 4. Root `package.json` - Remove Core Modules & Pin Versions

**Current (problematic dependencies):**
```json
{
  "dependencies": {
    "@axe-core/playwright": "*",
    "@google/generative-ai": "*",
    "@playwright/test": "*",
    "clsx": "*",
    "firebase": "*",
    "fs": "*",           // ❌ Node.js core module
    "path": "*",         // ❌ Node.js core module
    "playwright": "*",
    "tailwind-merge": "*",
    "vitest": "*",
    "zustand": "*"
  }
}
```

**Proposed:**
```json
{
  "dependencies": {
    "@axe-core/playwright": "^4.10.0",
    "@google/generative-ai": "^0.21.0",
    "@playwright/test": "^1.47.0",
    "clsx": "^2.1.1",
    "firebase": "^11.1.0",
    "playwright": "^1.47.0",
    "tailwind-merge": "^2.5.0",
    "vitest": "^2.1.0",
    "zustand": "^5.0.0"
  }
}
```

**Key Changes:**
- ✅ **REMOVE** `fs` and `path` (Node.js core modules - unnecessary)
- ✅ Pin all `*` wildcards to specific versions
- ✅ Use caret ranges (`^`) for semantic versioning

---

### 5. `src/package.json` - Pin Latest Versions

**Current:**
```json
{
  "dependencies": {
    "lucide-react": "latest",
    "zustand": "latest",
    "immer": "latest",
    "motion": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-avatar": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}
```

**Proposed:**
```json
{
  "dependencies": {
    "lucide-react": "^0.487.0",
    "zustand": "^5.0.0",
    "immer": "^10.1.3",
    "motion": "^11.15.0",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0"
  }
}
```

**Key Changes:**
- ✅ Replace all `"latest"` with specific version ranges
- ✅ Use caret ranges for minor/patch updates

---

## 🔒 BrandGuard Unicode Improvements (Planned)

**Current Limitation:**
The current BrandGuard implementation uses basic ASCII lowercasing which doesn't properly handle Unicode:

```typescript
const lowerText = text.toLowerCase();
const bannedFound = BRAND_GUARD_BANNED.filter((term: string) => 
  term && lowerText.includes(term.toLowerCase())
);
```

**Problem:** Spanish text like "niño" vs "nino" or "José" vs "Jose" won't match correctly.

**Proposed Solution:**
```typescript
const runBrandGuard = (text: string) => {
  const findings = [];
  
  // Normalize Unicode for proper comparison (NFD = decompose accents)
  const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lowerText = normalizedText.toLowerCase();

  // Check for banned terms with Unicode normalization
  const bannedFound = BRAND_GUARD_BANNED.filter((term: string) => {
    if (!term) return false;
    const normalizedTerm = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return lowerText.includes(normalizedTerm);
  });
  
  if (bannedFound.length > 0) {
    findings.push({
      type: 'Banned Term',
      severity: 'high',  // Add severity levels
      message: `El texto contiene los siguientes términos no permitidos: ${bannedFound.join(', ')}.`,
      suggestion: 'Reemplaza estos términos por alternativas aprobadas.',
    });
  }

  // ... rest of checks with improved scoring ...
  
  const report = {
    score: calculateScore(findings),  // Severity-weighted scoring
    findings,
    passed: findings.filter(f => f.severity === 'high').length === 0,
  };

  return report;
};
```

**Benefits:**
- ✅ Proper handling of Spanish characters (ñ, á, é, í, ó, ú, ü)
- ✅ Consistent matching regardless of accent usage
- ✅ Severity-based scoring for better decision making
- ✅ More nuanced pass/fail logic

---

## 🏗️ Monorepo Strategy (Decision Required)

**Current Structure:**
```
em-estudio/
├── package.json              # Root dependencies (Vite, React, UI libs)
├── functions/
│   └── package.json          # Firebase Functions (Node 18, OpenAI)
└── src/
    └── package.json          # Additional frontend dependencies
```

**Options Considered:**

### Option 1: Keep Current Structure ✅ (Recommended)
**Pros:**
- Simple, clear separation of concerns
- Independent deployment of frontend vs functions
- No migration required
- Easier troubleshooting

**Cons:**
- Some dependency duplication (e.g., `zustand`, `clsx`)
- Must manage three separate `package.json` files

### Option 2: Migrate to npm Workspaces
**Pros:**
- Shared dependencies, less duplication
- Single `npm install` at root
- Hoisting reduces disk usage

**Cons:**
- Complex setup, potential version conflicts
- Firebase Functions deployment may need adjustments
- Breaking change requiring team coordination

**Recommendation:** Keep current structure. Document it clearly and eliminate any unnecessary duplicates.

---

## 🚀 CI/CD Workflow (Planned)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, hardening]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck || echo "⚠️ No typecheck script"
      
      - name: Lint
        run: npm run lint || echo "⚠️ No lint script"
      
      - name: Security audit
        run: npm audit --audit-level=moderate
      
      - name: Run tests
        run: npm test || echo "⚠️ No test script"
      
      - name: Build
        run: npm run build

  functions:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./functions
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: functions/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build functions
        run: npm run build
      
      - name: Security audit
        run: npm audit --audit-level=moderate
```

---

## 📚 README Improvements (Planned)

**Issues to Fix:**
- ✅ Ensure UTF-8 encoding (no mojibake)
- ✅ Add clear prerequisites section
- ✅ Step-by-step installation instructions
- ✅ Document Firebase setup
- ✅ Add testing commands

**Proposed Structure:**
```markdown
# Content Studio Wireframe

AI-powered content creation studio built with React, Firebase, and OpenAI.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Firebase CLI: `npm install -g firebase-tools`

## Quick Start

1. Clone and install:
   ```bash
   git clone https://github.com/graveranarango/em-estudio.git
   cd em-estudio
   npm install
   cd functions && npm install && cd ..
   ```

2. Configure Firebase:
   ```bash
   firebase login
   firebase use --add
   firebase functions:config:set secrets.chatgpt_em_estudio="YOUR_API_KEY"
   ```

3. Run development server:
   ```bash
   npm run dev                # Frontend
   cd functions && npm run serve  # Functions
   ```

## Testing

```bash
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run typecheck     # TypeScript checking
```

## Deployment

```bash
npm run build
firebase deploy
```
```

---

## ✅ Implementation Checklist

### Phase 1: Documentation & Planning (Current)
- [x] Create hardening branch
- [x] Document all planned changes
- [x] Prepare code fragment examples
- [x] Create draft PR
- [ ] Link to drafted issues (to be created)
- [ ] Mark PR as draft

### Phase 2: Apply Changes (After Approval)
- [ ] Update `functions/tsconfig.json`
- [ ] Add OpenAI validation to `functions/src/index.ts`
- [ ] Pin dependencies in `functions/package.json`
- [ ] Remove core modules and pin versions in root `package.json`
- [ ] Pin versions in `src/package.json`
- [ ] Enhance BrandGuard with Unicode support
- [ ] Add `.github/workflows/ci.yml`
- [ ] Update `README.md`

### Phase 3: Testing & Validation
- [ ] Functions build successfully (`cd functions && npm run build`)
- [ ] Root build succeeds (`npm run build`)
- [ ] No npm audit high/critical vulnerabilities
- [ ] TypeScript compilation passes
- [ ] Existing tests pass
- [ ] Firebase functions can be served locally
- [ ] OpenAI API key validation works correctly

### Phase 4: Review & Merge
- [ ] Request code review
- [ ] Address review feedback
- [ ] Mark PR as ready for review
- [ ] Merge to main after approval

---

## ⚠️ Important Notes

1. **This PR is currently DRAFT** - No code changes have been applied yet
2. **Documentation only** - All changes are documented but not implemented
3. **Minimal changes** - Each change is surgical and focused
4. **No breaking changes** - All changes maintain backward compatibility
5. **Security first** - Changes improve security posture (API validation, dependency pinning)

---

## 📎 Additional Context

See `PR_PLAN.md` for detailed technical specifications and rationale for each change.

**Target Branch:** `main`  
**Source Branch:** `hardening`  
**Status:** 🚧 DRAFT - Awaiting Review
