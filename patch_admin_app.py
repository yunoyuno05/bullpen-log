import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { BaseballIcon } from './components/BaseballIcon';", "import { BaseballIcon } from './components/BaseballIcon';\nimport { AdminPanel } from './components/AdminPanel';")

old_admin = """            {activeTab === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center h-[70vh]"
              >
                <div className="text-center space-y-4 max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <h2 className="text-2xl font-bold text-white">⚙️ 관리자 패널</h2>
                  <p className="text-gray-400">/hidden-master-panel 경로로 직접 이동하여 접근하세요.</p>
                </div>
              </motion.div>
            )}"""

new_admin = """            {activeTab === 'admin' && currentUser?.isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AdminPanel />
              </motion.div>
            )}"""

content = content.replace(old_admin, new_admin)

with open('src/App.tsx', 'w') as f:
    f.write(content)

