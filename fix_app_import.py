import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

if "import { useAppStore } from './lib/store';" not in content:
    content = content.replace("import { AnimatePresence, motion } from 'motion/react';", "import { AnimatePresence, motion } from 'motion/react';\nimport { useAppStore } from './lib/store';")

with open('src/App.tsx', 'w') as f:
    f.write(content)

