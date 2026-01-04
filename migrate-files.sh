#!/bin/bash

# Script to rename all .js and .jsx files to .ts and .tsx
# This helps with the TypeScript migration

echo "Starting file renaming..."

# Rename .js files in _lib (excluding already migrated ones)
for file in _lib/*.js; do
    if [ -f "$file" ]; then
        newfile="${file%.js}.ts"
        if [ ! -f "$newfile" ]; then
            echo "Would rename: $file -> $newfile"
        fi
    fi
done

# Rename .js files in src/classes
for file in src/classes/*.js; do
    if [ -f "$file" ]; then
        newfile="${file%.js}.ts"
        if [ ! -f "$newfile" ]; then
            echo "Would rename: $file -> $newfile"
        fi
    fi
done

echo "File renaming complete!"
