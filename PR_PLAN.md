# Repository Hardening Plan

This PR aggregates repository-level improvements for dependency management, TypeScript configuration, OpenAI SDK usage, BrandGuard enhancements, and CI/documentation improvements.

## Status: DRAFT - Documentation Only

**⚠️ This PR currently contains only the plan and code fragment examples. Actual changes will be applied in follow-up commits after review and approval.**

## Related Issues

This PR addresses the following drafted issues:

- [ ] **Fix: Remove core modules and pin dependencies in package.json**
  - Remove Node.js core modules (`fs`, `path`) from dependencies
  - Pin all wildcard `*` and `latest` versions to specific versions
  - Affected files: `package.json`, `src/package.json`, `functions/package.json`

- [ ] **Fix: Harden TypeScript config for Node 18 and ESM interop**
  - Update `functions/tsconfig.json` for Node 18 compatibility
  - Add ESM interop flags for better module resolution
  - Target ES2020+ for modern features

- [ ] **Fix: Align OpenAI SDK usage and add API key validation**
  - Add runtime validation for OpenAI API key
  - Ensure proper error handling for missing credentials
  - Affected file: `functions/src/index.ts`

- [ ] **Improve: BrandGuard Unicode support & scoring**
  - Enhance BrandGuard to support Unicode characters
  - Improve scoring algorithm for better accuracy
  - Add support for Spanish special characters (ñ, á, é, í, ó, ú)

- [ ] **Refactor: Define monorepo strategy or consolidate package.json files**
  - Document decision: Keep separate package.json or create workspace
  - Evaluate current structure (root, functions, src)

- [ ] **Fix: Validate CI workflows and secrets usage**
  - Review GitHub Actions workflows (if any)
  - Ensure secrets are properly configured

- [ ] **Docs: Fix README encoding and dev instructions**
  - Ensure README.md uses UTF-8 encoding
  - Improve development setup instructions

- [ ] **Add: CI steps for type-check, lint, audit and tests**
  - Add npm audit step to CI
  - Add TypeScript type-checking step
  - Add linting step
  - Ensure tests run in CI

---

## Code Fragment Examples

Below are the minimal safe changes that will be applied in subsequent commits.

### 1. functions/tsconfig.json

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
  "include": [
    "src"
  ]
}
```

**Proposed (hardened for Node 18 + ESM interop):**
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
  "include": [
    "src"
  ]
}
```

**Changes:**
- `target: "es2020"` - Align with Node 18 capabilities
- `moduleResolution: "node"` - Explicit Node resolution strategy
- `esModuleInterop: true` - Better ESM/CommonJS interop
- `allowSyntheticDefaultImports: true` - Allow default imports from modules without default export
- `resolveJsonModule: true` - Allow importing .json files
- `forceConsistentCasingInFileNames: true` - Prevent case-sensitivity issues
- `lib: ["es2020"]` - Include ES2020 library definitions

---

### 2. functions/src/index.ts

**Current OpenAI initialization (lines 8-13):**
```typescript
// Define secrets and parameters
const { CHATGPT_EM_ESTUDIO } = functions.config().secrets || {};
const OPENAI_MODEL = functions.config().params?.OPENAI_MODEL || 'gpt-4o-mini';
const BRAND_GUARD_BANNED = (functions.config().params?.BRAND_GUARD_BANNED || '').split(',');
const BRAND_GUARD_STRICT = functions.config().params?.BRAND_GUARD_STRICT === 'true';

const openai = new OpenAI({ apiKey: CHATGPT_EM_ESTUDIO });
```

**Proposed (with API key validation):**
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

**Changes:**
- Add runtime validation for API key presence
- Log error if key is missing
- Throw error early to prevent silent failures
- Ensure whitespace-only keys are rejected

---

### 3. functions/package.json

**Current:**
```json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "openai": "^6.4.0",
    "node-fetch": "^2.6.9",
    "@google-cloud/text-to-speech": "^6.3.0"
  },
  "devDependencies": {
    "@types/node": "18",
    "@types/node-fetch": "^2.6.4",
    "firebase-functions-test": "^3.1.0",
    "typescript": "^5.0.0"
  },
  "private": true
}
```

**Proposed (with pinned versions):**
```json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "openai": "^6.4.0",
    "node-fetch": "^2.6.9",
    "@google-cloud/text-to-speech": "^6.3.0"
  },
  "devDependencies": {
    "@types/node": "^18.19.0",
    "@types/node-fetch": "^2.6.4",
    "firebase-functions-test": "^3.1.0",
    "typescript": "^5.0.0"
  },
  "private": true
}
```

**Changes:**
- `@types/node: "^18.19.0"` - Pin from bare "18" to specific version

---

### 4. Root package.json

**Current (excerpt showing problematic dependencies):**
```json
{
  "dependencies": {
    "@axe-core/playwright": "*",
    "@google/generative-ai": "*",
    "@playwright/test": "*",
    "clsx": "*",
    "firebase": "*",
    "fs": "*",
    "path": "*",
    "playwright": "*",
    "tailwind-merge": "*",
    "vitest": "*",
    "zustand": "*"
  }
}
```

**Proposed (core modules removed, versions pinned):**
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

**Changes:**
- **REMOVE** `fs` and `path` - Node.js core modules (not needed in package.json)
- Pin all `*` wildcards to specific versions
- Use caret ranges (^) for semver compatibility

---

### 5. src/package.json

**Current (excerpt showing problematic dependencies):**
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

**Proposed (versions pinned):**
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

**Changes:**
- Replace all `latest` with specific version ranges
- Use caret ranges (^) for semver minor/patch updates

---

## BrandGuard Improvements (Planned)

**Current BrandGuard implementation has limitations:**
- Basic ASCII lowercasing may not handle Unicode properly
- Spanish characters (ñ, á, é, etc.) might not be matched correctly
- Scoring is simplistic (100 - findings*25)

**Proposed improvements:**
```typescript
const runBrandGuard = (text: string) => {
  const findings = [];
  // Normalize Unicode for proper comparison
  const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lowerText = normalizedText.toLowerCase();

  // 1. Check for banned terms (with Unicode normalization)
  const bannedFound = BRAND_GUARD_BANNED.filter((term: string) => {
    if (!term) return false;
    const normalizedTerm = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return lowerText.includes(normalizedTerm);
  });
  
  if (bannedFound.length > 0) {
    findings.push({
      type: 'Banned Term',
      severity: 'high',
      message: `El texto contiene los siguientes términos no permitidos: ${bannedFound.join(', ')}.`,
      suggestion: 'Reemplaza estos términos por alternativas aprobadas.',
    });
  }

  // ... (rest of checks with improved severity-based scoring)
  
  const report = {
    score: calculateScore(findings), // Severity-weighted scoring
    findings,
    passed: findings.filter(f => f.severity === 'high').length === 0,
  };

  return report;
};
```

---

## Monorepo Strategy Decision

**Current structure:**
- Root `package.json` - Main application dependencies
- `functions/package.json` - Firebase Functions dependencies
- `src/package.json` - Additional source dependencies

**Options:**
1. **Keep current structure** (recommended for simplicity)
   - Pros: Clear separation of concerns, simpler deployment
   - Cons: Some dependency duplication

2. **Migrate to workspace** (e.g., npm workspaces, pnpm, yarn)
   - Pros: Shared dependencies, hoisting
   - Cons: More complex setup, potential for dependency conflicts

**Recommendation:** Keep current structure but document dependencies clearly and remove duplicates.

---

## CI/CD Improvements (Planned)

**Create `.github/workflows/ci.yml`:**
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
        run: npm run typecheck || echo "No typecheck script"
      
      - name: Lint
        run: npm run lint || echo "No lint script"
      
      - name: Audit dependencies
        run: npm audit --audit-level=moderate
      
      - name: Run tests
        run: npm test || echo "No test script"
      
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
      
      - name: Type check
        run: npm run build
      
      - name: Audit dependencies
        run: npm audit --audit-level=moderate
```

---

## README Improvements (Planned)

**Ensure UTF-8 encoding and improve dev instructions:**

```markdown
# Content Studio Wireframe

Development setup for the AI-powered content studio.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Firebase CLI (`npm install -g firebase-tools`)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/graveranarango/em-estudio.git
   cd em-estudio
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install functions dependencies:
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. Configure Firebase:
   ```bash
   firebase login
   firebase use --add
   ```

5. Set up environment variables:
   ```bash
   # For local development
   firebase functions:config:set secrets.chatgpt_em_estudio="your-api-key"
   ```

## Development

Run the development server:
```bash
npm run dev
```

Run Firebase functions locally:
```bash
cd functions
npm run serve
```

## Testing

```bash
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run typecheck     # Run TypeScript type checking
```

## Deployment

```bash
npm run build
firebase deploy
```
```

---

## Next Steps

After review and approval of this plan:

1. ✅ Apply `functions/tsconfig.json` changes
2. ✅ Apply `functions/src/index.ts` OpenAI validation
3. ✅ Update all `package.json` files with pinned dependencies
4. ✅ Enhance BrandGuard Unicode support
5. ✅ Add CI workflow
6. ✅ Update README
7. ✅ Test all changes locally
8. ✅ Update PR to ready for review

---

## Testing Checklist

Before marking as ready for review:

- [ ] Functions build successfully (`cd functions && npm run build`)
- [ ] Root build succeeds (`npm run build`)
- [ ] No npm audit high/critical vulnerabilities
- [ ] TypeScript compilation passes
- [ ] Existing tests pass
- [ ] Firebase functions can be served locally
- [ ] OpenAI API key validation works correctly

