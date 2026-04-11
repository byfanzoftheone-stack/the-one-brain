#!/bin/bash

echo ""
echo "========================================"
echo "THE ONE ECOSYSTEM ARCHITECTURE SCAN"
echo "========================================"
echo ""

echo "Core directories:"
ls -d */ | sort

echo ""
echo "Checking key architecture domains..."

domains=("apps" "modules" "agents" "runtime" "warehouse" "tools" "labs" "frontend" "backend")

for d in "${domains[@]}"
do
    if [ -d "$d" ]; then
        echo "✓ $d exists"
    else
        echo "⚠ missing: $d"
    fi
done

echo ""
echo "Checking forbidden placements..."

if find apps -type d -name modules | grep -q modules; then
    echo "⚠ ERROR: modules found inside apps"
fi

if find modules -type d -name frontend | grep -q frontend; then
    echo "⚠ ERROR: UI found inside modules"
fi

if find apps -type d -name agents | grep -q agents; then
    echo "⚠ ERROR: agents inside apps"
fi

echo ""
echo "Ecosystem tree snapshot:"
echo ""

tree -L 2 2>/dev/null || find . -maxdepth 2 -type d | sort

echo ""
echo "========================================"
echo "SCAN COMPLETE"
echo "========================================"
