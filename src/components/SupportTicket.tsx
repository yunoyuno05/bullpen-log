import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Send } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  category: string;
  status: '대기' | '완료';
  date: string;
  description: string;
  reply?: string;
}

const mockTickets: Ticket[] = [
  {
    id: 't1',
    title: '프로 등급 결제했는데 반영이 안됩니다',
    category: '결제',
    status: '완료',
    date: '2024-03-20',
    description: '결제 영수증은 메일로 받았는데, 여전히 무료 등급으로 표시됩니다. 확인 부탁드립니다.',
    reply: '안녕하세요 고객님. 결제 시스템 동기화 지연으로 불편을 드려 죄송합니다. 현재 고객님의 계정은 정상적으로 프로 등급으로 변경 완료되었습니다. 앱을 재시작하시면 적용된 내용을 확인하실 수 있습니다.'
  },
  {
    id: 't2',
    title: '가동범위(ROM) 영상 업로드 오류',
    category: '오류',
    status: '대기',
    date: '2024-03-25',
    description: '용량이 큰 영상을 올리려고 하니 500 에러가 납니다. 제한 용량이 있나요?',
  }
];

export const SupportTicket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'new'>('my');
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // New Ticket Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('결제');
  const [newDescription, setNewDescription] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: '대기',
      date: new Date().toISOString().split('T')[0],
      description: newDescription
    };

    setTickets([newTicket, ...tickets]);
    setActiveTab('my');
    setNewTitle('');
    setNewDescription('');
    setNewCategory('결제');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-6">고객 지원</h2>
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'my' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            내 문의 내역
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'new' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            새 문의하기
          </button>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-gray-900 border border-white/10 rounded-2xl p-6"
      >
        {activeTab === 'my' && (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center text-gray-500 py-12">등록된 문의 내역이 없습니다.</div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${ticket.status === '완료' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {ticket.status}
                        </span>
                        <span className="text-xs text-gray-400">{ticket.category}</span>
                        <span className="text-xs text-gray-500">{ticket.date}</span>
                      </div>
                      <h4 className="text-white font-medium">{ticket.title}</h4>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedTicketId === ticket.id ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {expandedTicketId === ticket.id && (
                    <div className="p-5 border-t border-white/10 bg-black/20 space-y-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2">문의 내용</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{ticket.description}</p>
                      </div>
                      
                      {ticket.reply && (
                        <div className="pl-4 border-l-2 border-blue-500">
                          <div className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2">
                            <span>관리자 답변</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{ticket.reply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <form onSubmit={handleSubmitTicket} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">카테고리</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="결제">결제</option>
                <option value="오류">오류 및 버그</option>
                <option value="건의사항">건의사항</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">제목</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="문의 제목을 입력하세요"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">상세 내용</label>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={6}
                placeholder="도움이 필요한 내용을 상세히 적어주세요."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            
            <button 
              type="submit"
              disabled={!newTitle.trim() || !newDescription.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              제출하기
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
