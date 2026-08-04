import sys
import re

with open('src/components/UserProfileModal.tsx', 'r') as f:
    content = f.read()

# Add useAppStore import if not present
if 'useAppStore' not in content:
    content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { useAppStore } from '../lib/store';")

# Add Palette import
if 'Palette' not in content:
    content = content.replace("import { Mail", "import { Palette, Mail")

# Find the start of the component to add store usage
store_hook = """
  const { theme, setTheme } = useAppStore();
"""
content = content.replace(
"""export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateProfile,
}) => {""",
"""export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateProfile,
}) => {
  const { theme, setTheme } = useAppStore();
"""
)

theme_ui = """
            {/* Theme Settings */}
            <div className="pt-3 pb-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> 앱 테마 설정</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button 
                  onClick={() => setTheme('light')}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${theme === 'light' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                  Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${theme === 'dark' ? 'bg-black text-white border-white/40 shadow-[0_0_0_2px_rgba(255,255,255,1)]' : 'bg-gray-900 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                  Dark
                </button>
                <button 
                  onClick={() => setTheme('baseball-classic')}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${theme === 'baseball-classic' ? 'bg-[#F4F1EA] text-[#2B2B2B] border-[#b51c1c]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                  Classic
                </button>
                <button 
                  onClick={() => setTheme('high-contrast')}
                  className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${theme === 'high-contrast' ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                  High-Contrast
                </button>
              </div>
            </div>

            {/* Logout Action */}"""

content = content.replace("{/* Logout Action */}", theme_ui)

with open('src/components/UserProfileModal.tsx', 'w') as f:
    f.write(content)
