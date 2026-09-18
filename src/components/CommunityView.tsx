import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  ArrowLeft, 
  X, 
  Smile, 
  Sparkles, 
  Users,
  UserPlus
} from 'lucide-react';
import { CommunityPost, Comment, HealthCategory, UserProfile, CharacterAvatar } from '../types';
import { CHARACTER_AVATAR_MAP, getUserProfile } from '../utils/profile';
import {
  ALL_SAMPLE_FRIENDS,
  ChallengerFriend,
  getFriendships,
  getSentRequests,
  getReceivedRequests,
  saveFriendships,
  saveSentRequests,
  saveReceivedRequests,
  getFriendById
} from '../utils/friendStorage';
import FriendManagementModal from './FriendManagementModal';
import { 
  StandardCategory, 
  normalizeCategory, 
  getCategoryConfig, 
  CATEGORY_CONFIG 
} from '../utils/category';

export interface CommunityViewProps {
  posts: CommunityPost[];
  onAddPost: (category: HealthCategory, content: string, imageUrl?: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment?: (postId: string, commentContent: string) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  userProfile?: UserProfile | null;
  nickname: string;
  praiseCardReceived?: boolean;
  praiseMessageText?: string;
  onSendPraiseRequest?: () => void;
  onReceivePraiseCard?: (msg: string) => void;
  onClearPraise?: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'drink' | 'star') => void;
}

// Clean raw URL strings from text body to prevent showing URLs to the user
const cleanPostContent = (content: string) => {
  if (!content) return '';
  return content
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/www\.[^\s]+/g, '')
    .trim();
};

// 3 Standard Health categories for post creation
const WRITE_CATEGORIES: { id: StandardCategory; label: StandardCategory; emoji: string }[] = [
  { id: '신체적 건강', label: '신체적 건강', emoji: '💪' },
  { id: '사회적 건강', label: '사회적 건강', emoji: '👥' },
  { id: '정서적 건강', label: '정서적 건강', emoji: '💗' },
];

// Quick cheering preset comments
const QUICK_CHEER_OPTIONS = [
  '대단해요! 👏',
  '응원해요 💙',
  '오늘도 멋져요 🌟',
  '계속 해봐요 😊',
];

const WATER_IMAGE_LOCAL = '/images/fresh-water.jpg';
const WATER_IMAGE_REMOTE = 'https://images.unsplash.com/photo-1696446370329-7e7e7a2935dc?auto=format&fit=crop&w=400&q=80';

// Preset photos for optional attachment
const PRESET_POST_IMAGES = [
  { name: '공원 아침 산책', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80' },
  { name: '건강 식단', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' },
  { name: '가벼운 운동', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
  { 
    name: '맑은 물 한 잔', 
    url: WATER_IMAGE_LOCAL,
    fallbackUrl: WATER_IMAGE_REMOTE
  }
];

export default function CommunityView({
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  userProfile,
  nickname,
  praiseCardReceived = false,
  praiseMessageText = '',
  onSendPraiseRequest,
  onReceivePraiseCard,
  onClearPraise,
  showToast
}: CommunityViewProps) {
  // Two tabs: 'myPractice' (내 실천 자랑하기) and 'friendPractice' (친구 응원하기)
  const [activeTab, setActiveTab] = useState<'myPractice' | 'friendPractice'>('myPractice');
  
  // Current active profile
  const activeProfile = userProfile || getUserProfile();
  const currentUserName = activeProfile?.name || nickname || '나';

  // Friendships and request state backed by localStorage
  const [friendships, setFriendships] = useState<string[]>(() => getFriendships(currentUserName));
  const [sentRequests, setSentRequests] = useState<string[]>(() => getSentRequests());
  const [receivedRequests, setReceivedRequests] = useState<string[]>(() => getReceivedRequests());

  // Friend Management Modal state
  const [showFriendModal, setShowFriendModal] = useState<boolean>(false);
  const [friendModalTab, setFriendModalTab] = useState<'search' | 'received' | 'friends'>('search');

  // Selected friend filter in Tab 2 (by userId)
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  // Post write modal state
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [writeCategory, setWriteCategory] = useState<StandardCategory>('신체적 건강');
  const [writeContent, setWriteContent] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [failedThumbnails, setFailedThumbnails] = useState<{ [name: string]: boolean }>({});
  const [currentThumbnailSrc, setCurrentThumbnailSrc] = useState<{ [name: string]: string }>({});
  const [failedPreview, setFailedPreview] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirm dialogs
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<{ postId: string; commentId: string } | null>(null);

  // Active comment input text per post
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Friend Management Handlers
  const handleSendFriendRequest = (targetUserId: string) => {
    if (sentRequests.includes(targetUserId)) return;
    const updated = [...sentRequests, targetUserId];
    setSentRequests(updated);
    saveSentRequests(updated);
    const targetFriend = getFriendById(targetUserId);
    showToast?.(`${targetFriend?.name || '친구'}님에게 친구 요청을 보냈어요! ✉️`, 'success');
  };

  const handleAcceptFriendRequest = (fromUserId: string) => {
    const nextReceived = receivedRequests.filter((id) => id !== fromUserId);
    setReceivedRequests(nextReceived);
    saveReceivedRequests(nextReceived);

    if (!friendships.includes(fromUserId)) {
      const nextFriendships = [...friendships, fromUserId];
      setFriendships(nextFriendships);
      saveFriendships(nextFriendships);
    }

    const fromFriend = getFriendById(fromUserId);
    showToast?.(`${fromFriend?.name || '친구'}님과 친구가 되었어요! 이제 건강 실천을 함께 응원해요. 🎉`, 'success');
  };

  const handleRejectFriendRequest = (fromUserId: string) => {
    const nextReceived = receivedRequests.filter((id) => id !== fromUserId);
    setReceivedRequests(nextReceived);
    saveReceivedRequests(nextReceived);

    const fromFriend = getFriendById(fromUserId);
    showToast?.(`${fromFriend?.name || '친구'}님의 친구 요청을 거절했어요.`, 'info');
  };

  const handleRemoveFriend = (friendUserId: string) => {
    const nextFriendships = friendships.filter((id) => id !== friendUserId);
    setFriendships(nextFriendships);
    saveFriendships(nextFriendships);
    if (selectedFriendId === friendUserId) {
      setSelectedFriendId(null);
    }
    const friend = getFriendById(friendUserId);
    showToast?.(`${friend?.name || '친구'} 친구와의 연결을 해제했어요.`, 'info');
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit write post form
  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeContent.trim()) return;

    onAddPost(writeCategory, writeContent.trim(), selectedImage || undefined);
    setWriteContent('');
    setSelectedImage('');
    setWriteCategory('신체적 건강');
    setShowWriteModal(false);
  };

  // Submit comment
  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment?.(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Submit quick cheer comment
  const handleQuickCheer = (postId: string, cheerText: string) => {
    onAddComment?.(postId, cheerText);
  };

  // Confirm delete post
  const handleConfirmDeletePost = () => {
    if (deletingPostId) {
      onDeletePost?.(deletingPostId);
      setDeletingPostId(null);
    }
  };

  // Confirm delete comment
  const handleConfirmDeleteComment = () => {
    if (deletingComment) {
      onDeleteComment?.(deletingComment.postId, deletingComment.commentId);
      setDeletingComment(null);
    }
  };

  // Filtering: My Posts (내 실천 자랑하기)
  const myPosts = posts.filter((post) => {
    if (post.id === 'default-child-practice-post') return false;
    if (post.isMine === true || post.postScope === 'myPractice') return true;
    if (post.authorName && currentUserName && post.authorName.trim() === currentUserName.trim()) {
      if (post.postScope === 'friendPractice') return false;
      return true;
    }
    return false;
  });

  // Active accepted friends list (matching ALL_SAMPLE_FRIENDS by userId)
  const myFriends = ALL_SAMPLE_FRIENDS.filter((friend) => friendships.includes(friend.userId));
  const selectedFriendObj = selectedFriendId ? getFriendById(selectedFriendId) : null;

  // Filtering: Friend Posts (친구 응원하기)
  // Requirement 12: Only show posts whose authorId is in friendships
  const friendPosts = posts.filter((post) => {
    // Requirement 12: Compare authorId with friendships list
    if (!post.authorId || !friendships.includes(post.authorId)) {
      return false;
    }

    // If filtered by specific friend
    if (selectedFriendId) {
      return post.authorId === selectedFriendId;
    }

    return true;
  });

  // Render avatar helper
  const renderAuthorAvatar = (post: CommunityPost) => {
    // If post has photo
    if (post.authorAvatarType === 'photo' && post.authorAvatarValue) {
      return (
        <img 
          src={post.authorAvatarValue} 
          alt={post.authorName} 
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
          referrerPolicy="no-referrer" 
        />
      );
    }
    if (post.authorAvatar) {
      return (
        <img 
          src={post.authorAvatar} 
          alt={post.authorName} 
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
          referrerPolicy="no-referrer" 
        />
      );
    }
    // If character
    const charKey = (post.authorAvatarValue || 'smile') as CharacterAvatar;
    const charEmoji = CHARACTER_AVATAR_MAP[charKey]?.emoji || '🙂';
    return (
      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shrink-0 select-none">
        {charEmoji}
      </div>
    );
  };

  return (
    <div className="w-full pb-14">
      {/* Top Header */}
      <header className="flex justify-between items-center py-4 border-b border-surface-container-high mb-4 sticky top-0 bg-[#ffffff]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-extrabold text-on-surface">응원 커뮤니티</h1>
        </div>

        {/* Top Right: 글쓰기 button */}
        <button
          id="btn-open-community-write-modal"
          type="button"
          onClick={() => setShowWriteModal(true)}
          className="px-3.5 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>글쓰기</span>
        </button>
      </header>

      {/* Two Clear Tabs at the Top */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          id="tab-btn-my-practice"
          type="button"
          onClick={() => setActiveTab('myPractice')}
          className={`py-3.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'myPractice'
              ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 font-black shadow-xs'
              : 'bg-white text-slate-600 border-2 border-slate-200 font-bold hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🌟</span>
          <span className="text-sm font-black tracking-tight">내 실천 자랑하기</span>
        </button>

        <button
          id="tab-btn-friend-practice"
          type="button"
          onClick={() => setActiveTab('friendPractice')}
          className={`py-3.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'friendPractice'
              ? 'bg-blue-50 text-blue-700 border-2 border-blue-500 font-black shadow-xs'
              : 'bg-white text-slate-600 border-2 border-slate-200 font-bold hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🌞</span>
          <span className="text-sm font-black tracking-tight">친구 응원하기</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 내 실천 자랑하기 */}
      {/* ======================================================== */}
      {activeTab === 'myPractice' && (
        <div className="space-y-5 text-left">
          {/* Section Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-2xs space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>내 실천 자랑하기</span>
              <span>🌟</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              오늘 해낸 건강 실천을 올려보세요. 가족과 친구가 응원해줘요.
            </p>
          </div>

          {/* Posts Feed or Empty State */}
          {myPosts.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 mx-auto bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-3xl">
                🌟
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-slate-800">
                  아직 올린 글이 없어요.
                </p>
                <p className="text-xs text-slate-500 font-bold">
                  오늘 해낸 일을 자랑해볼까요?
                </p>
              </div>
              <button
                id="btn-empty-write"
                type="button"
                onClick={() => setShowWriteModal(true)}
                className="px-6 py-3 bg-primary hover:bg-primary-container text-white text-sm font-black rounded-xl inline-flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                글쓰기
              </button>
            </div>
          ) : (
            /* User's Posts List */
            <div className="space-y-4">
              {myPosts.map((post) => {
                const catInfo = getCategoryConfig(post.category);
                const commentsList = post.comments || [];
                const isCommentOpen = true; // Always open for easy access by youth

                return (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 relative"
                  >
                    {/* Post Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 min-w-0">
                        {renderAuthorAvatar(post)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-black text-slate-900">{post.authorName}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border whitespace-nowrap shrink-0 ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}>
                              {catInfo.emoji} {catInfo.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                            {post.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Post Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingPostId(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="글 지우기"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                      {cleanPostContent(post.content)}
                    </p>

                    {/* Attached Image (if present, shown via img tag only, never url string) */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden max-h-64 border border-slate-100 bg-slate-50">
                        <img 
                          src={post.imageUrl} 
                          alt="실천 사진" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            if (post.imageUrl === WATER_IMAGE_LOCAL) {
                              (e.target as HTMLImageElement).src = WATER_IMAGE_REMOTE;
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Likes & Comments Count Row */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => onLikePost(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          post.hasLiked 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>좋아요 {post.likes}</span>
                      </button>

                      {/* Comment count display */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-50 text-slate-600 border border-slate-200">
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        <span>댓글 {commentsList.length}</span>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-3 pt-2">
                      {/* Quick Cheering Options */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black text-slate-500">
                          빠른 응원 남기기:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_CHEER_OPTIONS.map((cheer) => (
                            <button
                              key={cheer}
                              type="button"
                              onClick={() => handleQuickCheer(post.id, cheer)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                            >
                              {cheer}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Comment Input Area */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCommentSubmit(post.id);
                            }
                          }}
                          placeholder="응원 댓글을 써보세요."
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(post.id)}
                          className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-xl shrink-0 cursor-pointer shadow-2xs"
                        >
                          댓글
                        </button>
                      </div>

                      {/* Comments List */}
                      {commentsList.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {commentsList.map((c) => (
                            <div 
                              key={c.id} 
                              className="bg-slate-50 rounded-2xl p-3 border border-slate-150 flex justify-between items-start gap-2"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-primary">{c.authorName}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{c.createdAt}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                  {c.content}
                                </p>
                              </div>

                              {/* Comment delete button */}
                              <button
                                type="button"
                                onClick={() => setDeletingComment({ postId: post.id, commentId: c.id })}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                                title="댓글 지우기"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 친구 응원하기 */}
      {/* ======================================================== */}
      {activeTab === 'friendPractice' && (
        <div className="space-y-6 text-left">
          {/* Section Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-2xs space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>친구 응원하기</span>
              <span>🌞</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              친구들의 건강 실천을 보고 따뜻하게 응원해요.
            </p>
          </div>

          {/* 1) 발달장애 건강 도전자 친구들 목록 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1 flex-wrap gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
                <span>발달장애 건강 도전자 친구들</span>
                <span className="text-xs font-bold text-primary">({myFriends.length}명)</span>
              </h3>

              <div className="flex items-center gap-2">
                {selectedFriendId && (
                  <button
                    type="button"
                    onClick={() => setSelectedFriendId(null)}
                    className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    전체 친구 보기
                  </button>
                )}

                {/* 친구 관리 버튼 (Requirement 1) */}
                <button
                  type="button"
                  onClick={() => {
                    setFriendModalTab('search');
                    setShowFriendModal(true);
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>친구 관리</span>
                  {receivedRequests.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="받은 친구 요청 있음" />
                  )}
                </button>
              </div>
            </div>

            {/* Friend Cards List */}
            {myFriends.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {myFriends.map((friend) => {
                  const friendPostsCount = posts.filter((p) => p.authorId === friend.userId).length;
                  const isSelected = selectedFriendId === friend.userId;

                  return (
                    <button
                      key={friend.userId}
                      type="button"
                      onClick={() => setSelectedFriendId(isSelected ? null : friend.userId)}
                      className={`w-full h-auto p-2.5 rounded-2xl border-2 flex items-center gap-2 sm:gap-2.5 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img
                          src={friend.avatarUrl}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-slate-900 whitespace-nowrap break-keep">
                            {friend.name}
                          </span>
                          {friend.tag && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded shrink-0">
                              {friend.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold block whitespace-nowrap break-keep mt-0.5">
                          기록 {friendPostsCount}개
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Requirement 14 */
              <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                  🤝
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed max-w-xs mx-auto">
                  아직 친구가 없어요. 친구를 추가하고 서로의 건강 실천을 응원해보세요!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFriendModalTab('search');
                    setShowFriendModal(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  친구 추가하러 가기
                </button>
              </div>
            )}
          </div>

          {/* 2) 친구들의 실천 기록 게시글 목록 */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-extrabold text-slate-800">
                {selectedFriendObj ? `${selectedFriendObj.name} 친구의 실천 기록` : '친구들의 최신 실천 기록'}
              </h3>
              {selectedFriendId && (
                <button
                  type="button"
                  onClick={() => setSelectedFriendId(null)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  뒤로
                </button>
              )}
            </div>

            {myFriends.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <span className="text-3xl block">🌱</span>
                <p className="text-sm font-bold text-slate-600">
                  아직 친구가 없어요. 친구를 추가하고 서로의 건강 실천을 응원해보세요!
                </p>
              </div>
            ) : friendPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <span className="text-3xl block">🌱</span>
                <p className="text-sm font-bold text-slate-600">
                  {selectedFriendObj ? `${selectedFriendObj.name} 친구의 새 실천 기록이 아직 없어요.` : '아직 친구들의 새 실천 기록이 없어요.'}
                </p>
                {selectedFriendId && (
                  <button
                    type="button"
                    onClick={() => setSelectedFriendId(null)}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl mt-2 cursor-pointer"
                  >
                    전체 친구 보기
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {friendPosts.map((post) => {
                  const catInfo = getCategoryConfig(post.category);
                  const commentsList = post.comments || [];

                  return (
                    <article 
                      key={post.id} 
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 relative"
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 min-w-0">
                          {renderAuthorAvatar(post)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-black text-slate-900">{post.authorName}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border whitespace-nowrap shrink-0 ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}>
                                {catInfo.emoji} {catInfo.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                              {post.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                        {cleanPostContent(post.content)}
                      </p>

                      {/* Attached Image */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden max-h-64 border border-slate-100 bg-slate-50">
                          <img 
                            src={post.imageUrl} 
                            alt="실천 사진" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            onError={(e) => {
                              if (post.imageUrl === WATER_IMAGE_LOCAL) {
                                (e.target as HTMLImageElement).src = WATER_IMAGE_REMOTE;
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* Likes & Comments Count */}
                      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                        {/* Like button */}
                        <button
                          type="button"
                          onClick={() => onLikePost(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            post.hasLiked 
                              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>좋아요 {post.likes}</span>
                        </button>

                        {/* Comment count */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-50 text-slate-600 border border-slate-200">
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          <span>댓글 {commentsList.length}</span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="space-y-3 pt-2">
                        {/* Quick Cheering Options */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black text-slate-500">
                            친구에게 응원 보내기:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_CHEER_OPTIONS.map((cheer) => (
                              <button
                                key={cheer}
                                type="button"
                                onClick={() => handleQuickCheer(post.id, cheer)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                              >
                                {cheer}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Comment Input Area */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCommentSubmit(post.id);
                              }
                            }}
                            placeholder="응원 댓글을 써보세요."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleCommentSubmit(post.id)}
                            className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-xl shrink-0 cursor-pointer shadow-2xs"
                          >
                            댓글
                          </button>
                        </div>

                        {/* Comments List */}
                        {commentsList.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {commentsList.map((c) => {
                              const isMyComment = c.authorName === currentUserName || c.authorName === '나';
                              return (
                                <div 
                                  key={c.id} 
                                  className="bg-slate-50 rounded-2xl p-3 border border-slate-150 flex justify-between items-start gap-2"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-primary">{c.authorName}</span>
                                      <span className="text-[10px] text-slate-400 font-medium">{c.createdAt}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                      {c.content}
                                    </p>
                                  </div>

                                  {/* Delete comment if it's authored by the current user */}
                                  {isMyComment && (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingComment({ postId: post.id, commentId: c.id })}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                                      title="댓글 지우기"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Write Post Modal (오늘 어떤 건강 실천을 했나요?) */}
      {/* ======================================================== */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-left space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-base font-black text-slate-900">
                오늘 어떤 건강 실천을 했나요?
              </h3>
              <button
                type="button"
                onClick={() => setShowWriteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWriteSubmit} className="space-y-4">
              {/* Category Select (3 Options) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  실천 카테고리 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WRITE_CATEGORIES.map((cat) => {
                    const isSelected = writeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setWriteCategory(cat.id)}
                        className={`py-2.5 px-1 sm:px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs scale-102'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  실천 내용
                </label>
                <textarea
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  placeholder="오늘 해낸 일을 써보세요."
                  rows={4}
                  className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 resize-none bg-slate-50/50"
                  required
                />
              </div>

              {/* Photo Attachment (Optional) */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    사진 첨부 (선택)
                  </span>

                  {/* Device upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    + 내 사진 첨부하기
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Preset photo thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_POST_IMAGES.map((img) => {
                    const isSelected = selectedImage === img.url || (img.fallbackUrl && selectedImage === img.fallbackUrl);
                    const hasError = failedThumbnails[img.name];
                    const displaySrc = currentThumbnailSrc[img.name] || img.url;

                    return (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => {
                          setSelectedImage(isSelected ? '' : img.url);
                          setFailedPreview(false);
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected ? 'border-primary shadow-sm scale-95' : 'border-transparent opacity-85 hover:opacity-100'
                        }`}
                      >
                        {hasError ? (
                          <div className="w-full h-full bg-sky-50 flex flex-col items-center justify-center text-sky-500 pb-3">
                            <span className="text-xl" role="img" aria-label="물방울">💧</span>
                          </div>
                        ) : (
                          <img
                            src={displaySrc}
                            alt={img.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => {
                              if (img.fallbackUrl && displaySrc !== img.fallbackUrl) {
                                setCurrentThumbnailSrc((prev) => ({ ...prev, [img.name]: img.fallbackUrl! }));
                              } else {
                                setFailedThumbnails((prev) => ({ ...prev, [img.name]: true }));
                              }
                            }}
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent text-white text-[9px] pt-2 pb-0.5 px-0.5 font-bold text-center leading-tight whitespace-nowrap overflow-visible">
                          {img.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Image preview with remove button if selected */}
                {selectedImage && (
                  <div className="relative rounded-2xl overflow-hidden max-h-48 border border-slate-200 bg-slate-50">
                    {failedPreview ? (
                      <div className="w-full h-36 bg-sky-50 flex flex-col items-center justify-center gap-1.5 text-sky-600">
                        <span className="text-3xl">💧</span>
                        <span className="text-xs font-bold">맑은 물 한 잔</span>
                      </div>
                    ) : (
                      <img
                        src={selectedImage}
                        alt={selectedImage === WATER_IMAGE_LOCAL || selectedImage === WATER_IMAGE_REMOTE ? '맑은 물 한 잔' : '선택된 사진'}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (selectedImage === WATER_IMAGE_LOCAL) {
                            setSelectedImage(WATER_IMAGE_REMOTE);
                          } else {
                            setFailedPreview(true);
                          }
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage('');
                        setFailedPreview(false);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors cursor-pointer"
                      title="사진 제거"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-container text-white text-sm font-black rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  올리기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Confirm Modal: Delete Post (이 글을 지울까요?) */}
      {/* ======================================================== */}
      {deletingPostId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">
                이 글을 지울까요?
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                삭제한 글은 다시 되돌릴 수 없어요.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePost}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-xl shadow-md transition-colors cursor-pointer"
              >
                지우기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Confirm Modal: Delete Comment (이 댓글을 지울까요?) */}
      {/* ======================================================== */}
      {deletingComment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">
                이 댓글을 지울까요?
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                삭제한 댓글은 다시 되돌릴 수 없어요.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingComment(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteComment}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-xl shadow-md transition-colors cursor-pointer"
              >
                지우기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend Management Modal */}
      <FriendManagementModal
        isOpen={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        currentUserName={currentUserName}
        friendships={friendships}
        sentRequests={sentRequests}
        receivedRequests={receivedRequests}
        onSendRequest={handleSendFriendRequest}
        onAcceptRequest={handleAcceptFriendRequest}
        onRejectRequest={handleRejectFriendRequest}
        onRemoveFriend={handleRemoveFriend}
        initialTab={friendModalTab}
      />
    </div>
  );
}
