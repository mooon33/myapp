import React, { useState, useEffect, useRef } from 'react';
import { Users, Shield, Zap, Sword, Crown, Plus, Search, LogOut, LogIn, X, Send, MessageSquare, AlertCircle, UserPlus, Circle, Swords, Trophy, Activity, Dumbbell } from 'lucide-react';
import { Guild, ChatMessage, Friend, ClassType } from '../types';
import { MOCK_CHAT_MESSAGES, MOCK_FRIENDS, TRANSLATIONS } from '../constants';

interface Props {
  guilds: Guild[];
  userGuildId: string | null;
  username: string;
  lang: 'en' | 'ru';
  onJoinGuild: (guildId: string) => void;
  onLeaveGuild: () => void;
  onCreateGuild: (data: { name: string; description: string; icon: Guild['icon'] }) => void;
  onStartSharedWorkout: (friendName: string) => void;
}

interface ConfirmationState {
  type: 'join' | 'leave';
  guild?: Guild;
}

const GuildsView: React.FC<Props> = ({ guilds, userGuildId, username, lang, onJoinGuild, onLeaveGuild, onCreateGuild, onStartSharedWorkout }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'rankings' | 'chat' | 'friends'>('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  // Friends State (Mocked local state)
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [isFriendSearchLoading, setIsFriendSearchLoading] = useState(false);
  const [friendSearchResult, setFriendSearchResult] = useState<string | null>(null);
  
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

  const t = TRANSLATIONS[lang];

  // Automatically switch tabs if guild status changes
  useEffect(() => {
    if (userGuildId && activeTab === 'find') {
      setActiveTab('chat');
    }
    // If we leave a guild, switch to find if we were in chat
    if (!userGuildId && activeTab === 'chat') {
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
      senderId: 'current-user', 
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

  const handleGuildClick = (guild: Guild) => {
     setSelectedGuild(guild);
  };

  const handleSearchFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearchTerm.trim()) return;

    setIsFriendSearchLoading(true);
    setFriendSearchResult(null);

    // Mock search simulation
    setTimeout(() => {
        setIsFriendSearchLoading(false);
        if (friendSearchTerm.toLowerCase() === 'error') {
            setFriendSearchResult('error');
        } else {
            setFriendSearchResult('success');
        }
    }, 1000);
  };

  const confirmAddFriend = () => {
      // Mock adding friend
      const newFriend: Friend = {
          id: `f-${Date.now()}`,
          username: friendSearchTerm,
          level: 1,
          class: ClassType.WARRIOR,
          status: 'offline',
          lastSeen: 'Just now'
      };
      setFriends(prev => [...prev, newFriend]);
      setIsAddFriendOpen(false);
      setFriendSearchTerm('');
      setFriendSearchResult(null);
  };

  const handleChallengeFriend = (friend: Friend) => {
      onStartSharedWorkout(friend.username);
      setSelectedFriend(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> {t.socialHub}
          </h2>
          {!userGuildId && !isCreating && activeTab !== 'friends' && (
             <button 
               onClick={() => setIsCreating(true)}
               className="bg-amber-600 hover:bg-amber-500 text-slate-950 p-2 rounded-lg font-bold text-xs flex items-center gap-1"
             >
              <Plus className="w-4 h-4" /> {t.guild}
            </button>
          )}
          {activeTab === 'friends' && (
             <button 
               onClick={() => setIsAddFriendOpen(true)}
               className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg font-bold text-xs flex items-center gap-1"
             >
              <UserPlus className="w-4 h-4" /> {t.addFriend}
            </button>
          )}
        </div>

        {/* Tabs */}
        {!isCreating && (
          <div className="flex p-1 bg-slate-800 rounded-lg overflow-x-auto no-scrollbar">
             {userGuildId && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === 'chat' 
                    ? 'bg-slate-700 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> {t.chat}
              </button>
            )}
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'friends' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.friends}
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'find' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.guilds}
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'rankings' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.rankings}
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
              <h3 className="text-lg font-bold text-white">{t.createGuild}</h3>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.guildName} <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full bg-slate-900 border ${formErrors.name ? 'border-red-500' : 'border-slate-700'} rounded-lg p-3 text-white focus:border-amber-500 focus:outline-none`}
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.manifesto} <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  value={createForm.description}
                  onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full bg-slate-900 border ${formErrors.description ? 'border-red-500' : 'border-slate-700'} rounded-lg p-3 text-white h-24 focus:border-amber-500 focus:outline-none resize-none`}
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
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  {t.createGuild}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {activeTab === 'friends' && (
               <div className="p-4 space-y-3">
                  {friends.length === 0 ? (
                     <div className="text-center text-slate-500 py-10">
                        <p>No friends yet. Add some!</p>
                     </div>
                  ) : (
                     friends.map(friend => (
                        <div 
                            key={friend.id} 
                            onClick={() => setSelectedFriend(friend)}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                 <img src={`https://picsum.photos/seed/${friend.username}/100/100`} alt="Friend" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-200 text-sm">{friend.username}</h4>
                                 <div className="text-[10px] text-slate-500">{t.lvl} {friend.level} {friend.class}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-1.5">
                              {friend.status === 'online' ? (
                                 <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded-full border border-green-900">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Online
                                 </span>
                              ) : (
                                 <span className="text-[10px] text-slate-600 font-bold">{friend.lastSeen}</span>
                              )}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}

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
                      placeholder={t.messagePlaceholder}
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
                    placeholder="Search..." 
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmation({ type: 'leave', guild });
                        }}
                        className="px-3 py-1.5 border border-red-900 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/40 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <LogOut className="w-3 h-3" /> {t.leave}
                      </button>
                    );
                  } else if (!userGuildId && !isFull) {
                    button = (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmation({ type: 'join', guild });
                        }}
                        className="px-3 py-1.5 border border-amber-600 text-amber-500 rounded-lg text-xs font-bold hover:bg-amber-600/10 transition-colors flex items-center gap-1 shrink-0"
                      >
                         <LogIn className="w-3 h-3" /> {t.join}
                      </button>
                    );
                  } else if (isFull) {
                    button = (
                      <span className="px-3 py-1.5 text-slate-600 text-xs font-bold cursor-not-allowed shrink-0">
                        {t.full}
                      </span>
                    );
                  } else {
                     // User is in another guild
                     button = (
                      <span className="px-3 py-1.5 text-slate-600 text-xs font-bold cursor-not-allowed shrink-0">
                        {t.join}
                      </span>
                     );
                  }

                  return (
                    <div 
                      key={guild.id} 
                      onClick={() => handleGuildClick(guild)}
                      className={`bg-slate-900 border rounded-xl p-4 flex items-center gap-4 transition-colors cursor-pointer active:scale-[0.98] ${isMyGuild ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0 relative">
                        {getIcon(guild.icon)}
                        {isMyGuild && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-slate-900"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold truncate ${isMyGuild ? 'text-amber-400' : 'text-white'}`}>
                          {guild.name} {isMyGuild && <span className="text-[10px] ml-1 text-slate-400 font-normal">({t.myGuild})</span>}
                        </h3>
                        <p className="text-slate-400 text-xs truncate">{guild.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {t.lvl} {Math.floor(guild.totalXp / 10000)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {guild.members}/{guild.maxMembers} {t.members}
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
                   <span>{t.guild}</span>
                   <span>Total XP</span>
                </div>
                {sortedByRank.map((guild, index) => {
                  let rankStyle = "bg-slate-800 text-slate-400";
                  if (index === 0) rankStyle = "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
                  if (index === 1) rankStyle = "bg-slate-300/20 text-slate-300 border-slate-300/50";
                  if (index === 2) rankStyle = "bg-amber-700/20 text-amber-700 border-amber-700/50";

                  return (
                    <div 
                      key={guild.id} 
                      onClick={() => handleGuildClick(guild)}
                      className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded font-bold border ${rankStyle}`}>
                        {guild.rank}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                          {getIcon(guild.icon)}
                        </div>
                        <div>
                          <h4 className="text-slate-200 font-bold text-sm">{guild.name}</h4>
                          <div className="text-[10px] text-slate-500">{guild.members} {t.members}</div>
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
                {confirmation.type === 'join' ? t.confirmJoin : t.confirmLeave}
              </h3>
              <button onClick={() => setConfirmation(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {confirmation.type === 'join' 
                ? `${t.joinText} "${confirmation.guild?.name}"?` 
                : `${t.leaveText} "${confirmation.guild?.name}"?`}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmation(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={confirmAction}
                className={`flex-1 py-3 rounded-xl font-bold text-slate-950 transition-colors ${
                  confirmation.type === 'join' 
                    ? 'bg-amber-500 hover:bg-amber-400' 
                    : 'bg-red-500 hover:bg-red-400'
                }`}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Guild Details Modal */}
      {selectedGuild && (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
              <button 
                onClick={() => setSelectedGuild(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center mb-6">
                 <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4">
                    {getIcon(selectedGuild.icon, "w-10 h-10")}
                 </div>
                 <h2 className="text-2xl font-bold text-white text-center">{selectedGuild.name}</h2>
                 <span className="text-amber-500 font-mono font-bold mt-1 text-sm">Rank #{selectedGuild.rank}</span>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4 mb-6 border border-slate-800">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.manifesto}</h4>
                 <p className="text-slate-300 text-sm leading-relaxed italic">"{selectedGuild.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">{t.members}</div>
                    <div className="font-bold text-xl text-white">{selectedGuild.members} / {selectedGuild.maxMembers}</div>
                 </div>
                 <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">Total XP</div>
                    <div className="font-bold text-xl text-amber-500">{(selectedGuild.totalXp / 1000).toFixed(1)}k</div>
                 </div>
              </div>

              <button 
                onClick={() => setSelectedGuild(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors"
              >
                {t.gotIt}
              </button>
            </div>
         </div>
      )}

      {/* Add Friend Modal */}
      {isAddFriendOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <button 
                  onClick={() => setIsAddFriendOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                   <X className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold text-white mb-4">{t.addFriend}</h3>
                
                <form onSubmit={handleSearchFriend} className="mb-4">
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.searchUser}</label>
                   <div className="flex gap-2">
                      <input 
                         type="text" 
                         value={friendSearchTerm}
                         onChange={(e) => setFriendSearchTerm(e.target.value)}
                         className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                         placeholder="e.g. IronLifter"
                      />
                      <button 
                         type="submit"
                         disabled={!friendSearchTerm || isFriendSearchLoading}
                         className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"
                      >
                         <Search className="w-5 h-5" />
                      </button>
                   </div>
                </form>

                {isFriendSearchLoading && (
                    <div className="text-center py-4 text-slate-500">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Searching...
                    </div>
                )}

                {!isFriendSearchLoading && friendSearchResult === 'error' && (
                    <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-red-200 text-sm text-center">
                        {t.userNotFound}
                    </div>
                )}

                {!isFriendSearchLoading && friendSearchResult === 'success' && (
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                {friendSearchTerm.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                 <div className="font-bold text-white">{friendSearchTerm}</div>
                                 <div className="text-xs text-slate-400">Level 1 Warrior</div>
                             </div>
                        </div>
                        <button 
                            onClick={confirmAddFriend}
                            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" /> {t.sendRequest}
                        </button>
                    </div>
                )}
             </div>
          </div>
      )}

      {/* Friend Profile Modal */}
      {selectedFriend && (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
              <button 
                onClick={() => setSelectedFriend(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center mb-6">
                 <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-3 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${selectedFriend.username}/200/200`} alt={selectedFriend.username} className="w-full h-full object-cover" />
                 </div>
                 <h2 className="text-2xl font-bold text-white text-center flex items-center gap-2">
                    {selectedFriend.username}
                    <span className={`w-3 h-3 rounded-full border-2 border-slate-900 ${selectedFriend.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                 </h2>
                 <span className="text-slate-400 text-sm">{selectedFriend.class} • {t.lvl} {selectedFriend.level}</span>
                 {selectedFriend.guildName && (
                     <span className="text-amber-500 text-xs font-bold mt-1 flex items-center gap-1">
                         <Shield className="w-3 h-3" /> {selectedFriend.guildName}
                     </span>
                 )}
              </div>

              {selectedFriend.stats && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">{t.squat}</div>
                          <div className="text-white font-mono font-bold">{selectedFriend.stats.squat_1rm}</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">{t.bench}</div>
                          <div className="text-white font-mono font-bold">{selectedFriend.stats.bench_1rm}</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">{t.deadlift}</div>
                          <div className="text-white font-mono font-bold">{selectedFriend.stats.deadlift_1rm}</div>
                      </div>
                  </div>
              )}

              <button 
                onClick={() => handleChallengeFriend(selectedFriend)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                <Swords className="w-5 h-5" /> {t.challenge}
              </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default GuildsView;