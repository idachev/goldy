#!/bin/bash
[ "$1" = -x ] && shift && set -x
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# build-project.sh - Local development build script for Goldy project
# This script performs all quality checks and tests that will be run in CI/CD

set -e  # Exit on any error

echo "🔨 Starting Goldy project build and validation..."
echo "=================================================="

# 1. Format check
echo "📝 Checking code formatting..."
npm run format:check
if [ $? -ne 0 ]; then
    echo "❌ Code formatting issues found. Run 'npm run format' to fix."
    exit 1
fi
echo "✅ Code formatting check passed"

# 2. Lint check
echo "🔍 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting issues found. Run 'npm run lint:fix' to fix auto-fixable issues."
    exit 1
fi
echo "✅ ESLint check passed"

# 3. TypeScript sync check
echo "🔄 Checking TypeScript project references..."
npx nx sync:check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript references are out of sync. Run 'npx nx sync' to fix."
    exit 1
fi
echo "✅ TypeScript sync check passed"

# 4. Type checking
echo "🔧 Running TypeScript type checking on all projects..."
npx nx run-many --target=typecheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript type checking failed."
    exit 1
fi
echo "✅ TypeScript type checking passed"

# 5. Build all projects
echo "🏗️  Building all projects..."
npx nx run-many --target=build
if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi
echo "✅ All projects built successfully"

# 6. Run all tests
echo "🧪 Running all tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed."
    exit 1
fi
echo "✅ All tests passed"

echo "=================================================="
echo "🎉 Build completed successfully!"
echo "All quality checks passed:"
echo "  ✅ Code formatting"
echo "  ✅ ESLint"
echo "  ✅ TypeScript sync"
echo "  ✅ Type checking"
echo "  ✅ Build"
echo "  ✅ Tests"
echo ""
echo "Ready for commit and deployment! 🚀"
