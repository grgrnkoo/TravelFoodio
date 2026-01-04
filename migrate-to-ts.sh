#!/bin/bash

# Batch migration script for TypeScript conversion
# This script renames .js to .ts and .jsx to .tsx

set -e

echo "=== TypeScript Migration Script ==="
echo ""

# Function to rename files
rename_files() {
    local dir=$1
    local from_ext=$2
    local to_ext=$3
    
    find "$dir" -name "*.$from_ext" -type f | while read file; do
        newfile="${file%.$from_ext}.$to_ext"
        if [ ! -f "$newfile" ]; then
            mv "$file" "$newfile"
            echo "Renamed: $file -> $newfile"
        else
            echo "Skipped (TS file exists): $file"
        fi
    done
}

# Migrate src/lib files
echo "Migrating src/lib..."
if [ -d "src/lib" ]; then
    rename_files "src/lib" "js" "ts"
fi

# Migrate src/components files
echo "Migrating src/components..."
if [ -d "src/components" ]; then
    rename_files "src/components" "js" "tsx"
    rename_files "src/components" "jsx" "tsx"
fi

# Migrate src/app files
echo "Migrating src/app..."
if [ -d "src/app" ]; then
    rename_files "src/app" "js" "tsx"
    rename_files "src/app" "jsx" "tsx"
fi

# Migrate src/ui files
echo "Migrating src/ui..."
if [ -d "src/ui" ]; then
    rename_files "src/ui" "js" "tsx"
    rename_files "src/ui" "jsx" "tsx"
fi

echo ""
echo "=== Migration Complete ==="
echo "Note: You may need to add type annotations to the migrated files."
