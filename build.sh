#!/bin/bash

# Usage: bash build.sh
# This script builds the extension and creates a zip file for distribution

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DATE=$(date +%Y-%m-%d_%H%M) # Date format: YYYY-MM-DD_HHMM

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Determine whether to use Bun or npm
if command_exists bun; then
    PACKAGE_MANAGER="bun"
    echo -e "${GREEN}Bun detected. Using Bun for installation and building.${NC}"
else
    PACKAGE_MANAGER="npm"
    echo -e "${GREEN}Bun not detected. Using npm for installation and building.${NC}"
fi

# Check if node_modules directory exists in root
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}node_modules not found. Running $PACKAGE_MANAGER install...${NC}"
    $PACKAGE_MANAGER install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: $PACKAGE_MANAGER install failed${NC}"
        exit 1
    fi
fi

if ! command -v jq &> /dev/null
then
    echo -e "${RED}jq could not be found. Please install it using the following command:${NC}"
    echo -e "${GREEN}brew install jq${NC}"
    exit 1
fi

# Get version from extension package.json
VERSION=$(jq -r .version apps/extension/package.json)

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Unable to extract version from apps/extension/package.json${NC}"
  exit 1
fi

echo -e "${GREEN}Version extracted from package.json: $VERSION${NC}"

build_and_zip() {
  local zip_name=$1
  rm -f "$zip_name"

  echo -e "${YELLOW}Building extension...${NC}"
  if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run build:extension
  else
    npm run build:extension
  fi

  if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Extension build failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Extension build successful${NC}"

  echo -e "${YELLOW}Creating extension zip file...${NC}"
  cd apps/extension
  zip -r "../../$zip_name" build/
  cd ../..

  if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Zipping failed${NC}"
    exit 1
  fi

  if [ ! -f "$zip_name" ]; then
    echo -e "${RED}Error: Zip file not created${NC}"
    exit 1
  fi

  echo -e "${GREEN}✓ Build and zipping successful: $zip_name${NC}"

  # Clean up extension build directory
  rm -rf apps/extension/build/
  echo -e "${GREEN}✓ Extension build directory cleaned up${NC}"
}

if [ -d "apps/extension/build" ]; then
  rm -rf apps/extension/build/
fi

build_and_zip "extension-build-$VERSION-$DATE.zip"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Extension Build Complete!${NC}"
echo -e "${GREEN}📦 Package: extension-build-$VERSION-$DATE.zip${NC}"
echo -e "${GREEN}========================================${NC}"
