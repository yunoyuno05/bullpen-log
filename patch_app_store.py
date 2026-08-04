import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

if "import { useAppStore } from './lib/store';" not in content:
    content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { useAppStore } from './lib/store';")

sync_code = """  const setUserToStore = useAppStore(state => state.setUser);
  useEffect(() => {
    setUserToStore(currentUser);
  }, [currentUser, setUserToStore]);"""

if "const setUserToStore" not in content:
    content = content.replace("  // Load account data if currentUser is present on initial mount", sync_code + "\n\n  // Load account data if currentUser is present on initial mount")

with open('src/App.tsx', 'w') as f:
    f.write(content)
