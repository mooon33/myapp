
import React, { useState, useEffect, useRef } from 'react';
import { Users, Shield, Zap, Sword, Crown, Plus, Search, LogOut, LogIn, X, Send, MessageSquare, AlertCircle, UserPlus, Check, Trash2, UserX, Swords, ChevronRight, PenTool, DoorOpen, Loader2, Trophy } from 'lucide-react';
import { Guild, ChatMessage, Friend, ClassType, UserProfile } from '../types';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface Props {
  guilds: Guild[];
  userGuildId: string | null;
  username: string;
  currentUserId: string; // Passed from App
  lang: 'en' | 'ru';
  onJoinGuild: (guildId: string) => void;
  onLeaveGuild: () => void;
  onCreateGuild: (data: { name: string; description: string; icon: Guild['icon'] }) => void;
  onStartSharedWorkout: (friendName: string, friendId: string) => void;
}

interface ConfirmationState {
  type: 'join' | 'leave';
  guild?: Guild;
}

const GuildsView: React.FC<Props> = ({ guilds, userGuildId, username, currentUserId, lang, onJoinGuild, onLeaveGuild, onCreateGuild, onStartSharedWorkout }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'rankings' | 'chat' | 'friends'>('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  // Guild Members State
  const [guildMembers, setGuildMembers] = useState<UserProfile[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Friends State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [isFriendSearchLoading, setIsFriendSearchLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [friendSearchError, setFriendSearchError] = useState<string | null>(null);
  
  // Create Guild State
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<{
    name: string;
    description: string;
    icon: Guild['icon'];
  }>({ name: '', description: '', icon: 'shield' });
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string }>({});

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  // Fetch Friends
  useEffect(() => {
     if (activeTab === 'friends') {
        fetchFriends();
     }
  }, [activeTab]);

  const fetchFriends = async () => {
    try {
      const { data: sentRequests, error: sentError } = await supabase
        .from('friends')
        .select('*, friend:receiver_id(username, level, class)')
        .eq('sender_id', currentUserId);

      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friends')
        .select('*, friend:sender_id(username, level, class)')
        .eq('receiver_id', currentUserId);

      if (sentError) console.error(sentError);
      if (receivedError) console.error(receivedError);

      const mappedFriends: Friend[] = [];

      sentRequests?.forEach((req: any) => {
          mappedFriends.push({
              id: req.id,
              friendId: req.receiver_id,
              username: req.friend?.username || 'Unknown',
              level: req.friend?.level || 1,
              class: req.friend?.class || ClassType.WARRIOR,
              status: req.status,
              isSender: true
          });
      });

      receivedRequests?.forEach((req: any) => {
          mappedFriends.push({
              id: req.id,
              friendId: req.sender_id,
              username: req.friend?.username || 'Unknown',
              level: req.friend?.level || 1,
              class: req.friend?.class || ClassType.WARRIOR,
              status: req.status,
              isSender: false
          });
      });

      setFriends(mappedFriends);

    } catch (e) {
      console.error("Failed to load friends", e);
    }
  };

  // Chat Subscription
  useEffect(() => {
    if (activeTab !== 'chat' || !userGuildId) return;

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('guild_messages')
            .select('*')
            .eq('guild_id', userGuildId)
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (!error && data) {
            setMessages(data as ChatMessage[]);
        }
    };

    fetchMessages();

    const channel = supabase
      .channel('public:guild_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guild_messages', filter: `guild_id=eq.${userGuildId}` },
        (payload) => {
          setMessages((current) => {
             const newMsg = payload.new as ChatMessage;

             // 1. Check strict duplicate (if ID already exists)
             if (current.some(m => m.id === newMsg.id)) return current;

             // 2. Check for optimistic duplicate
             // Find a temp message by this user with the same content
             const tempMatchIndex = current.findIndex(m =>
                 m.id.startsWith('temp-') &&
                 m.content === newMsg.content &&
                 m.user_id === newMsg.user_id
             );

             if (tempMatchIndex !== -1) {
                 // Replace the temp message with the real one
                 const updated = [...current];
                 updated[tempMatchIndex] = newMsg;
                 return updated;
             }

             return [...current, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, userGuildId]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userGuildId) return;

    const text = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setNewMessage('');
    setChatError(null);

    // Optimistic Update
    const optimisticMsg: ChatMessage = {
        id: tempId,
        guild_id: userGuildId,
        user_id: currentUserId,
        username: username,
        content: text,
        created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
        const { error } = await supabase.from('guild_messages').insert({
            guild_id: userGuildId,
            user_id: currentUserId,
            username: username,
            content: text
        });

        if (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Rollback
            setChatError(t.sendError);
        }
    } catch (e) {
        console.error("Network error:", e);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setChatError(t.networkError);
    }
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

  const handleGuildClick = async (guild: Guild) => {
     setSelectedGuild(guild);
     setIsLoadingMembers(true);
     setGuildMembers([]);

     try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, level, class, current_xp') // Fetch specific fields
            .eq('guild_id', guild.id)
            .order('level', { ascending: false });

        if (!error && data && data.length > 0) {
            setGuildMembers(data as UserProfile[]);
        } else {
             // Fallback for mocks
             if (guild.id.startsWith('g-')) {
                 const mockMembers: any[] = Array.from({ length: Math.min(5, guild.members) }).map((_, i) => ({
                    id: `mock-${i}`,
                    username: `Member ${i + 1}`,
                    level: Math.floor(Math.random() * 20) + 1,
                    class: i % 3 === 0 ? ClassType.WARRIOR : i % 3 === 1 ? ClassType.SCOUT : ClassType.MONK,
                 }));
                 setGuildMembers(mockMembers);
            }
        }
     } catch (e) {
         console.error("Error fetching members:", e);
     } finally {
         setIsLoadingMembers(false);
     }
  };

  const handleSearchFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearchTerm.trim()) return;

    setIsFriendSearchLoading(true);
    setFoundUser(null);
    setFriendSearchError(null);

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', friendSearchTerm)
            .single();
        
        if (error || !data) {
            setFriendSearchError(t.userNotFound);
        } else if (data.id === currentUserId) {
            setFriendSearchError(t.selfAddError);
        } else {
            const existing = friends.find(f => f.friendId === data.id);
            if (existing) {
                setFriendSearchError(existing.status === 'accepted' ? t.alreadyFriends : t.requestPending);
            } else {
                setFoundUser(data as UserProfile);
            }
        }
    } catch (e) {
        setFriendSearchError(t.userNotFound);
    } finally {
        setIsFriendSearchLoading(false);
    }
  };

  const sendFriendRequest = async () => {
      if (!foundUser) return;
      try {
          const { error } = await supabase.from('friends').insert({
              sender_id: currentUserId,
              receiver_id: foundUser.id,
              status: 'pending'
          });
          if (error) throw error;
          setIsAddFriendOpen(false);
          setFriendSearchTerm('');
          setFoundUser(null);
          fetchFriends();
      } catch (e) {
          console.error(e);
          setFriendSearchError(t.sendError);
      }
  };

  const handleAcceptFriend = async (friend: Friend) => {
      try {
          await supabase.from('friends').update({ status: 'accepted' }).eq('id', friend.id);
          fetchFriends();
      } catch (e) { console.error(e); }
  };

  const handleRemoveFriend = async (friend: Friend) => {
      try {
          await supabase.from('friends').delete().eq('id', friend.id);
          setSelectedFriend(null);
          fetchFriends();
      } catch (e) { console.error(e); }
  };

  const handleChallengeFriend = (friend: Friend) => {
      onStartSharedWorkout(friend.username, friend.friendId);
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
          {!userGuildId && activeTab !== 'friends' && (
             <button 
               onClick={() => setIsCreating(true)}
               className="bg-amber-600 hover:bg-amber-500 text-slate-950 p-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-lg shadow-amber-900/20"
             >
              <Plus className="w-4 h-4" /> {t.guild}
            </button>
          )}
          {activeTab === 'friends' && (
             <button 
               onClick={() => setIsAddFriendOpen(true)}
               className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-lg shadow-blue-900/20"
             >
              <UserPlus className="w-4 h-4" /> {t.addFriend}
            </button>
          )}
        </div>

        {/* Tabs */}
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
          {activeTab === 'friends' && (
              <div className="p-4 space-y-3">
                  {friends.length === 0 ? (
                      <div className="text-center text-slate-500 py-10">
                        <p>{t.noFriends}</p>
                      </div>
                  ) : (
                      friends.map(friend => (
                        <div 
                            key={friend.id} 
                            onClick={() => friend.status === 'accepted' && setSelectedFriend(friend)}
                            className={`bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between transition-colors ${friend.status === 'accepted' ? 'cursor-pointer hover:bg-slate-800' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                                  {friend.username.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-200 text-sm">{friend.username}</h4>
                                  {friend.status === 'pending' ? (
                                      <div className="text-[10px] text-amber-500 font-bold">{t.pending}...</div>
                                  ) : (
                                      <div className="text-[10px] text-slate-500">{t.lvl} {friend.level} {friend.class}</div>
                                  )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {friend.status === 'accepted' ? (
                                  <ChevronRight className="w-5 h-5 text-slate-600" />
                              ) : (
                                  friend.isSender ? (
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend); }} className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded hover:bg-red-900/20 hover:text-red-400">
                                        {t.cancelRequest}
                                    </button>
                                  ) : (
                                      <div className="flex gap-2">
                                          <button onClick={(e) => { e.stopPropagation(); handleAcceptFriend(friend); }} className="p-1.5 bg-green-600 rounded text-white hover:bg-green-500">
                                              <Check className="w-4 h-4" />
                                          </button>
                                          <button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend); }} className="p-1.5 bg-red-600 rounded text-white hover:bg-red-500">
                                              <X className="w-4 h-4" />
                                          </button>
                                      </div>
                                  )
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
                      const isMe = msg.user_id === currentUserId;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${msg.id.startsWith('temp-') ? 'opacity-50' : ''}`}>
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {!isMe && (
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                  {msg.username.charAt(0)}
                                </div>
                              )}
                              <div 
                                className={`p-3 rounded-2xl text-sm break-words ${
                                  isMe 
                                    ? 'bg-amber-600 text-slate-950 rounded-br-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}
                              >
                                {!isMe && <div className="text-[10px] font-bold text-amber-500 mb-1">{msg.username}</div>}
                                {msg.content}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-600 mt-1 px-1">
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                      );
                    })}
                    {chatError && (
                        <div className="text-center text-red-500 text-xs py-2 bg-red-900/10 rounded border border-red-900/30">
                            {chatError}
                        </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
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

                {filteredGuilds.map(guild => {
                  const isMyGuild = userGuildId === guild.id;
                  const isFull = guild.members >= guild.maxMembers;
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
                        <DoorOpen className="w-3 h-3" /> {t.leave}
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
      </div>

      {/* CREATE GUILD MODAL */}
      {isCreating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-6 h-6 text-amber-500" /> {t.createGuild}
                </h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitCreate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guild Banner</label>
                  <div className="flex gap-4 justify-center">
                    {(['shield', 'sword', 'crown', 'zap'] as const).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCreateForm(prev => ({ ...prev, icon }))}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all transform hover:scale-105 ${
                          createForm.icon === icon 
                            ? 'bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105' 
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {getIcon(icon, "w-8 h-8")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                      <span>{t.guildName} <span className="text-red-500">*</span></span>
                      <span className={`text-[10px] ${createForm.name.length >= 3 ? 'text-green-500' : 'text-slate-600'}`}>
                          {createForm.name.length} / 20
                      </span>
                  </label>
                  <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <Shield className="w-4 h-4" />
                      </div>
                      <input 
                        type="text"
                        required
                        value={createForm.name}
                        onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value.slice(0, 20) }))}
                        className={`w-full bg-slate-950 border ${formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'} rounded-lg py-3 pl-10 pr-3 text-white focus:outline-none transition-all`}
                        placeholder="e.g. Iron Titans"
                      />
                  </div>
                  {formErrors.name && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-left-2">
                      <AlertCircle className="w-3 h-3" /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                      <span>{t.manifesto} <span className="text-red-500">*</span></span>
                      <span className={`text-[10px] ${createForm.description.length >= 10 ? 'text-green-500' : 'text-slate-600'}`}>
                          {createForm.description.length} / 100
                      </span>
                  </label>
                  <div className="relative">
                      <div className="absolute left-3 top-3 text-slate-500">
                          <PenTool className="w-4 h-4" />
                      </div>
                      <textarea 
                        required
                        value={createForm.description}
                        onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value.slice(0, 100) }))}
                        className={`w-full bg-slate-950 border ${formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'} rounded-lg py-3 pl-10 pr-3 text-white h-24 focus:outline-none resize-none transition-all`}
                        placeholder="What is your guild about?"
                      />
                  </div>
                  {formErrors.description && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-left-2">
                      <AlertCircle className="w-3 h-3" /> {formErrors.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
                  >
                    {t.createGuild}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

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
            <div className="bg-slate-900 border border-slate-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setSelectedGuild(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center mb-6 shrink-0">
                 <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4">
                    {getIcon(selectedGuild.icon, "w-10 h-10")}
                 </div>
                 <h2 className="text-2xl font-bold text-white text-center">{selectedGuild.name}</h2>
                 <span className="text-amber-500 font-mono font-bold mt-1 text-sm">Rank #{selectedGuild.rank}</span>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4 mb-6 border border-slate-800 shrink-0">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.manifesto}</h4>
                 <p className="text-slate-300 text-sm leading-relaxed italic">"{selectedGuild.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                 <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">{t.members}</div>
                    <div className="font-bold text-xl text-white">{selectedGuild.members} / {selectedGuild.maxMembers}</div>
                 </div>
                 <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">Total XP</div>
                    <div className="font-bold text-xl text-amber-500">{(selectedGuild.totalXp / 1000).toFixed(1)}k</div>
                 </div>
              </div>
              
              {/* Guild Members List */}
              <div className="flex-1 min-h-0 flex flex-col mb-6">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    {t.members}
                    {isLoadingMembers && <Loader2 className="w-3 h-3 animate-spin" />}
                 </h4>
                 
                 <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-y-auto min-h-[100px] max-h-[150px] p-2 space-y-1">
                    {!isLoadingMembers && guildMembers.length === 0 ? (
                        <div className="text-center text-slate-600 text-xs py-4">{t.noMembers}</div>
                    ) : (
                        guildMembers.map((member, index) => (
                           <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-900 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                                 {member.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col">
                                 <div className="flex items-center gap-2">
                                     <span className="text-sm font-bold text-slate-300 truncate">{member.username}</span>
                                     {index === 0 && <Crown className="w-3 h-3 text-yellow-500" />}
                                 </div>
                                 <div className="text-[10px] text-slate-500 capitalize">{member.class}</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[10px] text-amber-500 font-mono font-bold">Lvl {member.level}</div>
                                  <div className="text-[9px] text-slate-600 font-mono">{(member.current_xp / 1000).toFixed(1)}k XP</div>
                              </div>
                           </div>
                        ))
                    )}
                 </div>
              </div>

              <button 
                onClick={() => setSelectedGuild(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 transition-colors shrink-0"
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

                {!isFriendSearchLoading && friendSearchError && (
                    <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-red-200 text-sm text-center">
                        {friendSearchError}
                    </div>
                )}

                {!isFriendSearchLoading && foundUser && (
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                {foundUser.username.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                 <div className="font-bold text-white">{foundUser.username}</div>
                                 <div className="text-xs text-slate-400">Level {foundUser.level} {foundUser.class}</div>
                             </div>
                        </div>
                        <button 
                            onClick={sendFriendRequest}
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
                 <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-3 overflow-hidden font-bold text-4xl text-slate-600">
                    {selectedFriend.username.charAt(0)}
                 </div>
                 <h2 className="text-2xl font-bold text-white text-center flex items-center gap-2">
                    {selectedFriend.username}
                 </h2>
                 <span className="text-slate-400 text-sm">{selectedFriend.class} • {t.lvl} {selectedFriend.level}</span>
                 {selectedFriend.guildName && (
                     <span className="text-amber-500 text-xs font-bold mt-1 flex items-center gap-1">
                         <Shield className="w-3 h-3" /> {selectedFriend.guildName}
                     </span>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <button 
                    onClick={() => handleChallengeFriend(selectedFriend)}
                    className="col-span-2 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                  >
                    <Swords className="w-5 h-5" /> {t.inviteToWorkout}
                  </button>
                  <button 
                    onClick={() => handleRemoveFriend(selectedFriend)}
                    className="col-span-2 py-2 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <UserX className="w-4 h-4" /> {t.removeFriend}
                  </button>
              </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default GuildsView;
