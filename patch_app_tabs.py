import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace Community placeholder
old_comm = """            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center h-[70vh]"
              >
                <div className="text-center space-y-4 max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <h2 className="text-2xl font-bold text-white">⚾ 불펜 커뮤니티 (준비 중)</h2>
                  <p className="text-gray-400">선수들과 코치들이 피칭 데이터와 훈련 노하우를 공유하는 공간이 곧 오픈됩니다.</p>
                </div>
              </motion.div>
            )}"""

new_comm = """            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CommunityForum />
              </motion.div>
            )}"""
content = content.replace(old_comm, new_comm)

# Replace Support placeholder
old_supp = """            {activeTab === 'support' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center h-[70vh]"
              >
                <div className="text-center space-y-4 max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <h2 className="text-2xl font-bold text-white">🎧 고객 지원 (준비 중)</h2>
                  <p className="text-gray-400">1:1 문의, 장애 신고 및 피드백을 남길 수 있는 고객 지원 센터가 곧 오픈됩니다.</p>
                </div>
              </motion.div>
            )}"""

new_supp = """            {activeTab === 'support' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SupportTicket />
              </motion.div>
            )}"""
content = content.replace(old_supp, new_supp)

with open('src/App.tsx', 'w') as f:
    f.write(content)
