import sys

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Replace the layout
old_layout_start = """    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-2">
          <ShieldAlert className="text-blue-500 w-6 h-6" />
          <h1 className="text-xl font-bold">관리자 패널</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            유저 관리
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" />
            게시물 관리
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'support' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Headset className="w-5 h-5" />
            고객지원 관리
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate('/')} className="w-full text-sm text-gray-400 hover:text-white transition-colors">
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">"""

new_layout_start = """    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen relative">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-blue-500 w-8 h-8" />
        <h2 className="text-3xl font-bold text-white tracking-tight">관리자 패널</h2>
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
        <div className="flex-1 bg-gray-900 border border-white/10 rounded-3xl p-6 min-h-[600px]">"""

content = content.replace(old_layout_start, new_layout_start)

# End tag fixing
content = content.replace("      </div>\n\n      {/* Edit User Modal */}", "        </div>\n      </div>\n\n      {/* Edit User Modal */}")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)

