import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add SettingsTab import
if 'SettingsTab' not in content:
    content = content.replace("import { SupportTicket } from './components/SupportTicket';", "import { SupportTicket } from './components/SupportTicket';\nimport { SettingsTab } from './components/SettingsTab';")

settings_render = """            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SettingsTab 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                  onOpenProfile={() => setIsProfileModalOpen(true)} 
                />
              </motion.div>
            )}

            {activeTab === 'admin' && currentUser?.isAdmin && ("""

if "activeTab === 'settings'" not in content:
    content = content.replace("            {activeTab === 'admin' && currentUser?.isAdmin && (", settings_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)

