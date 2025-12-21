import React, { useState, useEffect, useRef } from 'react';
import { Users, Shield, Zap, Sword, Crown, Plus, Search, LogOut, LogIn, X, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { Guild, ChatMessage } from '../types';
import { MOCK_CHAT_MESSAGES } from '../constants';

interface Props {
  guilds: Guild[];
  userGuildId: string | null;
  username: string;
  onJoinGuild: (guildId: string) => void;
  onLeaveGuild: () => void;
  onCreateGuild: (data: { name: string; description: string; icon: Guild['icon'] }) => void;
}

interface ConfirmationState {
  type: 'join' | 'leave';
  guild?: Guild;
}

const GuildsView: React.FC<Props> = ({ guilds, userGuildId, username, onJoinGuild, onLeaveGuild, onCreateGuild }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'rankings' | 'chat'>('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  
  // Create Guild State
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<{
    name: string;
    description: string;
    icon: Guild['icon'];
  }>({ name: '', description: '', icon: 'shield' });
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string }>({});

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Automatically switch tabs if guild status changes
  useEffect(() => {
    if (userGuildId) {
      setActiveTab('chat');
      setIsCreating(false);
    } else {
      setActiveTab('find');
    }
  }, [userGuildId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const getIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'shield': return <Shield className={`${className} text-blue-400`} />;
      case 'zap': return <Zap className={`${className} text-amber-400`} />;
      case 'sword': return <Sword className={`${className} text-red-400`} />;
      case 'crown': return <Crown className={`${className} text-violet-400`} />;
      default: return <Shield className={`${className} text-slate-400`} />;
    }
  };

  const filteredGuilds = guilds.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedByRank = [...guilds].sort((a, b) => a.rank - b.rank);

  const confirmAction = () => {
    if (confirmation?.type === 'join' && confirmation.guild) {
      onJoinGuild(confirmation.guild.id);
    } else if (confirmation?.type === 'leave') {
      onLeaveGuild();
    }
    setConfirmation(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'current-user', // In real app this comes from auth
      senderName: username,
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const validateCreateForm = () => {
    const errors: { name?: string; description?: string } = {};
    if (!createForm.name.trim()) errors.name = 'Guild name is required';
    else if (createForm.name.length < 3) errors.name = 'Name must be at least 3 characters';
    
    if (!createForm.description.trim()) errors.description = 'Description is required';
    else if (createForm.description.length < 10) errors.description = 'Description must be at least 10 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCreateForm()) {
      onCreateGuild(createForm);
      setCreateForm({ name: '', description: '', icon: 'shield' });
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Guild Hall
          </h2>
          {!userGuildId && !isCreating && (
             <button 
               onClick={() => setIsCreating(true)}
               className="bg-amber-600 hover:bg-amber-500 text-slate-950 p-2 rounded-lg font-bold text-xs flex items-center gap-1"
             >
              <Plus className="w-4 h-4" /> Create
            </button>
          )}
        </div>

        {/* Tabs */}
        {!isCreating && (
          <div className="flex p-1 bg-slate-800 rounded-lg">
             {userGuildId && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'chat' 
                    ? 'bg-slate-700 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Chat
              </button>
            )}
            <button
              onClick={() => setActiveTab('find')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === 'find' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Find Guild
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === 'rankings' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Leaderboard
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
        {/* CREATE GUILD FORM */}
        {isCreating ? (
          <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Establish a Guild</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-6">
              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guild Banner</label>
                <div className="flex gap-4">
                  {(['shield', 'sword', 'crown', 'zap'] as const).map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, icon }))}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all ${
                        createForm.icon === icon 
                          ? 'bg-slate-800 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                          : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {getIcon(icon, "w-8 h-8")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guild Name</label>
                <input 
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Iron Titans"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manifesto (Description)</label>
                <textarea 
                  value={createForm.description}
                  onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-24 focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="What is your guild about?"
                />
                {formErrors.description && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  Create Guild
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {activeTab === 'chat' && userGuildId && (
              <div className="flex-1 flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.senderName === username;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-end gap-2 max-w-[80%]">
                              {!isMe && (
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                  {msg.senderName.charAt(0)}
                                </div>
                              )}
                              <div 
                                className={`p-3 rounded-2xl text-sm ${
                                  isMe 
                                    ? 'bg-amber-600 text-slate-950 rounded-br-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}
                              >
                                {!isMe && <div className="text-[10px] font-bold text-amber-500 mb-1">{msg.senderName}</div>}
                                {msg.text}
                              </div>
                           </div>
                           <span className="text-[10px] text-slate-600 mt-1 px-1">{msg.timestamp}</span>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                 </div>
                 
                 {/* Chat Input */}
                 <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                   <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message guild..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                   />
                   <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-amber-600 text-slate-900 rounded-full hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </form>
              </div>
            )}

            {activeTab === 'find' && (
              <div className="space-y-4 p-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search guilds..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                {/* List */}
                {filteredGuilds.map(guild => {
                  const isMyGuild = userGuildId === guild.id;
                  const isFull = guild.members >= guild.maxMembers;
                  
                  // Determine button state
                  let button = null;

                  if (isMyGuild) {
                    button = (
                      <button 
                        onClick={() => setConfirmation({ type: 'leave', guild })}
                        className="px-3 py-1.5 border border-red-900 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/40 transition-colors flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" /> Leave
                      </button>
                    );
                  } else if (!userGuildId && !isFull) {
                    button = (
                      <button 
                        onClick={() => setConfirmation({ type: 'join', guild })}
                        className="px-3 py-1.5 border border-amber-600 text-amber-500 rounded-lg text-xs font-bold hover:bg-amber-600/10 transition-colors flex items-center gap-1"
                      >
                         <LogIn className="w-3 h-3" /> Join
                      </button>
                    );
                  } else if (isFull) {
                    button = (
                      <span className="px-3 py-1.5 text-slate-600 text-xs font-bold cursor-not-allowed">
                        Full
                      </span>
                    );
                  } else {
                     // User is in another guild
                     button = (
                      <span className="px-3 py-1.5 text-slate-600 text-xs font-bold cursor-not-allowed">
                        Join
                      </span>
                     );
                  }

                  return (
                    <div 
                      key={guild.id} 
                      className={`bg-slate-900 border rounded-xl p-4 flex items-center gap-4 transition-colors ${isMyGuild ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0 relative">
                        {getIcon(guild.icon)}
                        {isMyGuild && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-slate-900"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold truncate ${isMyGuild ? 'text-amber-400' : 'text-white'}`}>
                          {guild.name} {isMyGuild && <span className="text-[10px] ml-1 text-slate-400 font-normal">(My Guild)</span>}
                        </h3>
                        <p className="text-slate-400 text-xs truncate">{guild.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            Lvl {Math.floor(guild.totalXp / 10000)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {guild.members}/{guild.maxMembers} Members
                          </span>
                        </div>
                      </div>
                      {button}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'rankings' && (
              <div className="space-y-2 p-4">
                <div className="flex justify-between text-xs text-slate-500 px-2 font-mono uppercase">
                   <span>Rank</span>
                   <span>Guild</span>
                   <span>Total XP</span>
                </div>
                {sortedByRank.map((guild, index) => {
                  let rankStyle = "bg-slate-800 text-slate-400";
                  if (index === 0) rankStyle = "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
                  if (index === 1) rankStyle = "bg-slate-300/20 text-slate-300 border-slate-300/50";
                  if (index === 2) rankStyle = "bg-amber-700/20 text-amber-700 border-amber-700/50";

                  return (
                    <div key={guild.id} className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className={`w-8 h-8 flex items-center justify-center rounded font-bold border ${rankStyle}`}>
                        {guild.rank}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                          {getIcon(guild.icon)}
                        </div>
                        <div>
                          <h4 className="text-slate-200 font-bold text-sm">{guild.name}</h4>
                          <div className="text-[10px] text-slate-500">{guild.members} members</div>
                        </div>
                      </div>
                      <div className="text-amber-500 font-mono font-bold text-sm">
                        {(guild.totalXp / 1000).toFixed(1)}k
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">
                {confirmation.type === 'join' ? 'Join Guild?' : 'Leave Guild?'}
              </h3>
              <button onClick={() => setConfirmation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {confirmation.type === 'join' 
                ? `Are you sure you want to join "${confirmation.guild?.name}"? You can only be in one guild at a time.` 
                : `Are you sure you want to leave "${confirmation.guild?.name}"? You will lose access to guild chat and bonuses.`}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmation(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className={`flex-1 py-3 rounded-xl font-bold text-slate-950 transition-colors ${
                  confirmation.type === 'join' 
                    ? 'bg-amber-500 hover:bg-amber-400' 
                    : 'bg-red-500 hover:bg-red-400'
                }`}
              >
                {confirmation.type === 'join' ? 'Confirm Join' : 'Confirm Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildsView;