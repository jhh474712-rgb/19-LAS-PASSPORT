import React, { useState } from 'react';
import { X, Search, UserPlus, Check, UserCheck, Users, AlertCircle } from 'lucide-react';
import { 
  ALL_SAMPLE_FRIENDS, 
  ChallengerFriend, 
  getFriendById 
} from '../utils/friendStorage';

interface FriendManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserName: string;
  friendships: string[];
  sentRequests: string[];
  receivedRequests: string[];
  onSendRequest: (targetUserId: string) => void;
  onAcceptRequest: (fromUserId: string) => void;
  onRejectRequest: (fromUserId: string) => void;
  onRemoveFriend: (friendUserId: string) => void;
  initialTab?: 'search' | 'received' | 'friends';
}

export default function FriendManagementModal({
  isOpen,
  onClose,
  currentUserName,
  friendships,
  sentRequests,
  receivedRequests,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  initialTab = 'search'
}: FriendManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'received' | 'friends'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendToRemove, setFriendToRemove] = useState<ChallengerFriend | null>(null);

  if (!isOpen) return null;

  // Filter friends for search (Requirement 4, 5, 6)
  // Exclude current user based on name
  const searchableFriends = ALL_SAMPLE_FRIENDS.filter((friend) => {
    // Exclude current logged in user
    if (friend.name.trim() === currentUserName.trim()) return false;
    
    // Partial nickname matching
    if (!searchQuery.trim()) return true; // Show all searchable friends if no query
    return friend.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  // Received requests list (Requirement 8)
  const receivedList = receivedRequests
    .map((id) => getFriendById(id))
    .filter((f): f is ChallengerFriend => Boolean(f));

  // Current friends list (Requirement 2, 9, 12)
  const myFriendsList = friendships
    .map((id) => getFriendById(id))
    .filter((f): f is ChallengerFriend => Boolean(f));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">친구 관리</h2>
              <p className="text-[11px] text-slate-500 font-medium">도전자 친구를 찾고 함께 응원해요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tabs Segmented Control (Requirement 2) */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200/80">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-2xl text-xs font-black">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer truncate text-center ${
                activeTab === 'search'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              친구 찾기
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                activeTab === 'received'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="truncate">받은 친구 요청</span>
              {receivedRequests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full shrink-0">
                  {receivedRequests.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                activeTab === 'friends'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="truncate">내 친구</span>
              <span className="text-[11px] opacity-75 shrink-0 font-bold">
                ({myFriendsList.length})
              </span>
            </button>
          </div>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-5 space-y-4">
          {/* TAB 1: 친구 찾기 (Requirement 3, 4, 5, 6, 7) */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="친구의 닉네임을 입력하세요 (예: 지훈, 이지은)"
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Notice */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                <span>도전자 친구 목록 ({searchableFriends.length}명)</span>
                {searchQuery && (
                  <span className="text-primary">‘{searchQuery}’ 검색 결과</span>
                )}
              </div>

              {/* Friends List */}
              {searchableFriends.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-2xl block">🔍</span>
                  <p className="text-xs font-bold text-slate-600">
                    ‘{searchQuery}’ 닉네임을 가진 친구를 찾을 수 없어요.
                  </p>
                  <p className="text-[11px] text-slate-400">다른 이름으로 검색해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchableFriends.map((friend) => {
                    const isAlreadyFriend = friendships.includes(friend.userId);
                    const isSent = sentRequests.includes(friend.userId);
                    const hasReceived = receivedRequests.includes(friend.userId);

                    return (
                      <div
                        key={friend.userId}
                        className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs transition-all"
                      >
                        {/* Profile Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={friend.avatarUrl}
                              alt={friend.name}
                              className="w-11 h-11 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow-2xs">
                              {friend.characterEmoji}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-black text-slate-900 truncate">{friend.name}</span>
                              <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {friend.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                              {friend.intro}
                            </p>
                          </div>
                        </div>

                        {/* Action Button (Requirement 7) */}
                        <div className="shrink-0">
                          {isAlreadyFriend ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200">
                              <UserCheck className="w-3.5 h-3.5" />
                              내 친구
                            </span>
                          ) : isSent ? (
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-black rounded-xl border border-slate-200 cursor-not-allowed"
                            >
                              <Check className="w-3.5 h-3.5" />
                              요청 보냄
                            </button>
                          ) : hasReceived ? (
                            <button
                              type="button"
                              onClick={() => setActiveTab('received')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-black rounded-xl border border-amber-200 cursor-pointer"
                            >
                              요청 확인
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSendRequest(friend.userId)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              친구 요청하기
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 받은 친구 요청 (Requirement 8, 9) */}
          {activeTab === 'received' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-500 font-bold px-1">
                도전자 친구들이 보낸 요청 ({receivedList.length}건)
              </div>

              {receivedList.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-3xl block">💌</span>
                  <p className="text-xs font-bold text-slate-600">
                    받은 친구 요청이 없어요.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    새로운 친구 요청이 오면 여기에 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {receivedList.map((friend) => (
                    <div
                      key={friend.userId}
                      className="p-3.5 bg-white rounded-2xl border border-blue-150 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={friend.avatarUrl}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow-2xs">
                            {friend.characterEmoji}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-slate-900">{friend.name}</span>
                            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {friend.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {friend.intro}
                          </p>
                        </div>
                      </div>

                      {/* Accept & Reject Buttons (Requirement 8, 9) */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => onRejectRequest(friend.userId)}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-colors cursor-pointer text-center"
                        >
                          거절
                        </button>
                        <button
                          type="button"
                          onClick={() => onAcceptRequest(friend.userId)}
                          className="flex-1 py-2 px-3 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          수락
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 내 친구 */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                <span>함께 건강 실천 중인 친구 ({myFriendsList.length}명)</span>
              </div>

              {myFriendsList.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="text-3xl block">🤝</span>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                    아직 친구가 없어요. 친구를 추가하고 서로의 건강 실천을 응원해보세요!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    친구 찾으러 가기
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {myFriendsList.map((friend) => (
                    <div
                      key={friend.userId}
                      className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={friend.avatarUrl}
                            alt={friend.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow-2xs">
                            {friend.characterEmoji}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-slate-900">{friend.name}</span>
                            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {friend.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {friend.intro}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFriendToRemove(friend)}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      >
                        친구 끊기
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Dialog: Remove Friend */}
      {friendToRemove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-4 border border-slate-100 text-left">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {friendToRemove.name} 친구와 연결을 끊을까요?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                친구 응원하기 목록에서 제외되며, 언제든 다시 친구를 요청할 수 있어요.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFriendToRemove(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-colors cursor-pointer text-center"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveFriend(friendToRemove.userId);
                  setFriendToRemove(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer text-center"
              >
                친구 끊기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
