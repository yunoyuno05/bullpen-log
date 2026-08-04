import sys

with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# Add imports for modal and additional icons
content = content.replace("import { Palette, LogOut, Globe, User, Edit3 } from 'lucide-react';", "import { Palette, LogOut, Globe, User, Edit3, Trash2, AlertTriangle, X } from 'lucide-react';\nimport { supabase } from '../lib/supabase';")

modal_state = """  const { theme, setTheme, language, setLanguage } = useAppStore();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴합니다') {
      setDeleteError('정확한 확인 문구를 입력해주세요.');
      return;
    }
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      // 1. Send telemetry or save reason if needed (optional)
      console.log('Account deleted. Reason:', deleteReason);

      // 2. Call Supabase RPC to delete the user
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        throw error;
      }
      
      // 3. Sign out and clear local state
      await supabase.auth.signOut();
      localStorage.clear();
      onLogout();
    } catch (err: any) {
      console.error('Delete account error:', err);
      setDeleteError(err.message || '탈퇴 처리 중 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };
"""

content = content.replace("  const { theme, setTheme, language, setLanguage } = useAppStore();", modal_state)

account_actions = """        {/* Account Actions */}
        <div className="pt-6 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
          
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            회원 탈퇴 (영구 삭제)
          </button>
        </div>"""

content = content.replace("""        {/* Account Actions */}
        <div className="pt-6">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>""", account_actions)

modal_ui = """      {/* Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-rose-900/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">회원 탈퇴</h3>
                </div>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-200 text-sm leading-relaxed">
                  <p className="font-bold text-rose-400 mb-2">탈퇴 전 주의사항</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>유저의 모든 정보, 기록, 영상 데이터는 <strong>영구히 삭제</strong>되며 복구할 수 없습니다.</li>
                    <li>구매한 요금제 및 프리미엄 구독 혜택은 즉시 소멸되며 환불되지 않습니다.</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">탈퇴 사유 (선택)</label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="탈퇴하시는 이유를 알려주시면 서비스 개선에 큰 도움이 됩니다."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500/50 resize-none h-24"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">
                    탈퇴 확인을 위해 아래 입력창에 <span className="text-rose-400 font-bold">탈퇴합니다</span> 라고 입력해주세요.
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="탈퇴합니다"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500/50"
                  />
                </div>
                
                {deleteError && (
                  <p className="text-rose-400 text-sm font-bold">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== '탈퇴합니다'}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? '처리 중...' : '영구 탈퇴'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}"""

content = content.replace("    </div>\n  );\n};", modal_ui + "\n    </div>\n  );\n};")

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)
