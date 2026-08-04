import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Heart, Share2, Plus, ArrowLeft, MoreHorizontal } from 'lucide-react';

interface Post {
  id: string;
  authorName: string;
  authorTier: string;
  timestamp: string;
  title: string;
  content: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  authorName: string;
  timestamp: string;
  content: string;
}

const mockPosts: Post[] = [
  {
    id: 'p1',
    authorName: '이강속',
    authorTier: 'PRO',
    timestamp: '2시간 전',
    title: 'Driveline 플라이오케어 볼 루틴 질문있습니다',
    content: '요즘 구속 정체기가 와서 플라이오케어 볼을 도입해보려고 합니다. 리버스 스로우할 때 날개뼈 쪽 자극이 오는게 정상인가요? 다른 분들은 루틴을 어떻게 가져가시는지 궁금합니다.',
    likes: 24,
    comments: [
      { id: 'c1', authorName: '김투수', timestamp: '1시간 전', content: '네, 능형근 쪽 자극이 오는게 맞습니다. 저는 주 3회 웜업으로 진행하고 있습니다.' },
      { id: 'c2', authorName: '박코치', timestamp: '30분 전', content: '통증이 아니라 뻐근한 느낌이라면 정상입니다. 무리하지 마시고 가벼운 무게부터 시작하세요.' }
    ]
  },
  {
    id: 'p2',
    authorName: '최컨트롤',
    authorTier: 'AMATEUR',
    timestamp: '5시간 전',
    title: '오늘 불펜 피칭 영상 (구속 142km/h)',
    content: '지난주 피드백 받고 힙-숄더 세퍼레이션 신경써서 던져봤습니다. 확실히 익스텐션이 앞으로 더 끌고나와지는 느낌이네요. 피드백 부탁드립니다!',
    likes: 45,
    comments: [
      { id: 'c3', authorName: '정분석', timestamp: '2시간 전', content: '좋네요! 골반 턴이 훨씬 부드러워졌습니다.' }
    ]
  }
];

export const CommunityForum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    const newPost: Post = {
      id: `p${Date.now()}`,
      authorName: '나',
      authorTier: 'PRO', // Mock
      timestamp: '방금 전',
      title: newTitle,
      content: newContent,
      likes: 0,
      comments: []
    };
    
    setPosts([newPost, ...posts]);
    setIsWriting(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleAddComment = () => {
    if (!selectedPost || !newComment.trim()) return;
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      authorName: '나',
      timestamp: '방금 전',
      content: newComment
    };
    
    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment]
    };
    
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    setSelectedPost(updatedPost);
    setNewComment('');
  };

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto min-h-screen relative text-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">커뮤니티</h2>
        <div className="flex items-center gap-2">
          <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium">전체 글</span>
          <span className="text-gray-500 px-3 py-1 text-sm font-medium hover:text-white cursor-pointer transition-colors">인기 글</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedPost && !isWriting ? (
          <motion.div 
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 pb-20"
          >
            {posts.map(post => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{post.authorName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          post.authorTier === 'PRO' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {post.authorTier}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{post.timestamp}</span>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center gap-6 text-gray-400 border-t border-white/5 pt-4">
                  <button className="flex items-center gap-1.5 text-sm hover:text-rose-400 transition-colors group-hover:text-gray-300">
                    <Heart className="w-4 h-4" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm hover:text-blue-400 transition-colors group-hover:text-gray-300">
                    <MessageCircle className="w-4 h-4" /> {post.comments.length}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm hover:text-white transition-colors ml-auto">
                    <Share2 className="w-4 h-4" /> 공유
                  </button>
                </div>
              </div>
            ))}
            
            {/* FAB */}
            <button 
              onClick={() => setIsWriting(true)}
              className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 z-10"
            >
              <Plus className="w-6 h-6" />
            </button>
          </motion.div>
        ) : isWriting ? (
          <motion.div
            key="write"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6"
          >
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
              <button onClick={() => setIsWriting(false)} className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold text-white">새 글 작성</h3>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="제목을 입력하세요" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <textarea 
                placeholder="내용을 입력하세요..." 
                rows={8}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleCreatePost}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                >
                  등록하기
                </button>
              </div>
            </div>
          </motion.div>
        ) : selectedPost ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] flex flex-col overflow-hidden"
            style={{ minHeight: '600px' }}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {selectedPost.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{selectedPost.authorName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        selectedPost.authorTier === 'PRO' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {selectedPost.authorTier}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{selectedPost.timestamp}</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">{selectedPost.title}</h1>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-6">{selectedPost.content}</p>
              
              <div className="flex items-center gap-6 text-gray-400 pb-2">
                <button className="flex items-center gap-2 hover:text-rose-400 transition-colors">
                  <Heart className="w-5 h-5" /> <span className="font-medium">{selectedPost.likes}</span>
                </button>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> <span className="font-medium">{selectedPost.comments.length}</span>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 bg-black/20 p-6 space-y-6 overflow-y-auto">
              {selectedPost.comments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">첫 번째 댓글을 남겨보세요.</div>
              ) : (
                selectedPost.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{comment.authorName}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Comment Input */}
            <div className="p-4 bg-gray-900 border-t border-white/10">
              <div className="flex items-end gap-3">
                <textarea 
                  placeholder="댓글을 입력하세요..." 
                  rows={2}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors h-[46px] flex items-center"
                >
                  등록
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
