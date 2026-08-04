import i18n from '../lib/i18n';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { UserAccount } from '../types';
import { Users, FileText, Headset, ShieldAlert, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';


const t = i18n.t.bind(i18n);

type AdminTab = 'users' | 'posts' | 'support';

export const AdminPanel: React.FC = () => {
  
  const { user, isAdmin } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      alert('접근 권한이 없습니다');
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data for UI if supabase fails
      const mockUsers: UserAccount[] = [
        { id: '1', email: 'test1@example.com', name: '김선수', subscriptionTier: 'FREE', joinedDate: '2024-01-01', isAdmin: false } as UserAccount,
        { id: '2', email: 'pro@example.com', name: '이프로', subscriptionTier: 'PRO', joinedDate: '2024-02-15', isAdmin: false } as UserAccount,
        { id: '3', email: 'cheatpt@gmail.com', name: '관리자', subscriptionTier: 'PRO', joinedDate: '2024-03-01', isAdmin: true } as UserAccount,
      ];
      const { data, error } = await supabase.from('profiles').select('*');
      if (data && data.length > 0) {
        setUsers(data as UserAccount[]);
      } else {
        setUsers(mockUsers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    alert('사용자 정보가 성공적으로 변경되었습니다.');
  };

  if (!isAdmin) return null;

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto min-h-screen text-white space-y-6 relative">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-blue-500 w-8 h-8" />
        <h2 className="text-2xl font-bold text-white tracking-tight">관리자 패널</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setActiveTab('users')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">유저 관리</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'posts' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">게시물 관리</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'support' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white'}`}
          >
            <Headset className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">고객지원 관리</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 min-h-[600px]">
        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">유저 관리</h2>
            <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">이름</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">이메일</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">현재 등급</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">가입일</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{u.name || '알 수 없음'}</div>
                        {u.isAdmin && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full mt-1 inline-block">{t('관리자')}</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.subscriptionTier === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
                          u.subscriptionTier === 'AMATEUR' ? 'bg-blue-500/20 text-blue-400' :
                          u.subscriptionTier === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {u.subscriptionTier || 'FREE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{u.joinedDate || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="max-w-6xl mx-auto text-center py-20 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">게시물 관리</h3>
            <p>준비 중인 기능입니다.</p>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-6xl mx-auto text-center py-20 text-gray-400">
            <Headset className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">고객지원 관리</h3>
            <p>준비 중인 기능입니다.</p>
          </div>
        )}
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">유저 정보 수정</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">이메일 (조회 전용)</label>
                  <input type="text" value={editingUser.email} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-400" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">구독 등급</label>
                  <select 
                    value={editingUser.subscriptionTier || 'FREE'} 
                    onChange={(e) => setEditingUser({...editingUser, subscriptionTier: e.target.value as any})}
                    className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="FREE">무료 (Free)</option>
                    <option value="BEGINNER">초보 (Beginner)</option>
                    <option value="AMATEUR">아마추어 (Amateur)</option>
                    <option value="PRO">프로 (Pro)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <input 
                    type="checkbox" 
                    id="isAdmin" 
                    checked={editingUser.isAdmin || false}
                    onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <div>
                    <label htmlFor="isAdmin" className="text-sm font-medium text-white block">관리자 권한 부여</label>
                    <span className="text-xs text-gray-400">해당 유저에게 시스템 관리자 권한을 부여합니다.</span>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveUser}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
