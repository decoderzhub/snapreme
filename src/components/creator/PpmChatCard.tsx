import { useState } from 'react';
import { MessageCircle, Coins, Send, Star, DollarSign, Gift as GiftIcon, Zap, Sparkles } from 'lucide-react';
import { InfoTooltip } from '../InfoTooltip';
import type { PpmMessage, Gift } from '../../types/database';
import { sendPaidMessage, sendTip, sendGift } from '../../lib/payments';

interface PpmChatCardProps {
  threadId: string | null;
  messages: PpmMessage[];
  balance: number;
  gifts: Gift[];
  currentUserId?: string;
  onBuyCoins: () => void;
  onRefreshBalance: () => void;
}

export function PpmChatCard({
  threadId,
  messages,
  balance,
  gifts,
  currentUserId,
  onBuyCoins,
  onRefreshBalance,
}: PpmChatCardProps) {
  const [messageText, setMessageText] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [showTipSelector, setShowTipSelector] = useState(false);
  const [showGiftSelector, setShowGiftSelector] = useState(false);
  const [sending, setSending] = useState(false);

  const messageCost = isPriority ? 20 : 10;
  const canSend = messageText.trim().length > 0 && balance >= messageCost && threadId;

  const handleSendMessage = async () => {
    if (!canSend || !threadId) return;

    setSending(true);
    try {
      await sendPaidMessage({
        threadId,
        text: messageText,
        isPriority,
      });
      setMessageText('');
      setIsPriority(false);
      onRefreshBalance();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendTip = async (tipCents: number) => {
    if (!threadId) return;

    try {
      await sendTip({ threadId, tipCents });
      setShowTipSelector(false);
      onRefreshBalance();
    } catch (error) {
      console.error('Failed to send tip:', error);
      alert(error instanceof Error ? error.message : 'Failed to send tip');
    }
  };

  const handleSendGift = async (gift: Gift) => {
    if (!threadId) return;

    try {
      await sendGift({
        threadId,
        giftEmoji: gift.emoji,
        coinCost: gift.coin_cost,
      });
      setShowGiftSelector(false);
      onRefreshBalance();
    } catch (error) {
      console.error('Failed to send gift:', error);
      alert(error instanceof Error ? error.message : 'Failed to send gift');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 via-slate-900/90 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[500px] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Direct Message</h3>
              <InfoTooltip content="Send paid messages directly to the creator. Each message costs coins. Priority messages (20 coins) get highlighted for better visibility." />
            </div>
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Pay-Per-Message</span>
            </div>
          </div>
        </div>
        <button
          onClick={onBuyCoins}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-full transition-colors border border-amber-500/30"
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">{balance}</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-4 border border-white/10">
              <Sparkles className="w-8 h-8 text-purple-400/60" />
            </div>
            <p className="text-white/70 text-sm font-medium mb-1">Start a conversation</p>
            <p className="text-white/40 text-xs">Send a message for just 10 coins</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/10'
                  }`}
                >
                  {msg.is_priority && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <Star className="w-3 h-3 text-amber-400" fill="#fbbf24" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">Priority</span>
                    </div>
                  )}

                  {msg.gift_emoji && (
                    <div className="text-4xl mb-2 drop-shadow-lg">{msg.gift_emoji}</div>
                  )}

                  {msg.tip_cents > 0 && (
                    <div className="flex items-center gap-1.5 mb-1.5 py-1 px-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 w-fit">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-emerald-300 text-sm">
                        ${(msg.tip_cents / 100).toFixed(2)} tip
                      </span>
                    </div>
                  )}

                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                  <p className={`text-[10px] mt-1.5 ${isOwn ? 'text-white/60' : 'text-white/40'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowTipSelector(!showTipSelector);
              setShowGiftSelector(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              showTipSelector
                ? 'bg-emerald-500/30 border-emerald-500/50'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            } border`}
            title="Send tip"
          >
            <DollarSign className={`w-5 h-5 ${showTipSelector ? 'text-emerald-400' : 'text-white/60'}`} />
          </button>
          <button
            onClick={() => {
              setShowGiftSelector(!showGiftSelector);
              setShowTipSelector(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              showGiftSelector
                ? 'bg-pink-500/30 border-pink-500/50'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            } border`}
            title="Send gift"
          >
            <GiftIcon className={`w-5 h-5 ${showGiftSelector ? 'text-pink-400' : 'text-white/60'}`} />
          </button>

          <label className="flex items-center gap-2 ml-auto px-3 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-amber-500"
            />
            <Star className={`w-3.5 h-3.5 ${isPriority ? 'text-amber-400' : 'text-white/40'}`} fill={isPriority ? '#fbbf24' : 'none'} />
            <span className={`text-xs font-medium ${isPriority ? 'text-amber-300' : 'text-white/60'}`}>
              Priority +10
            </span>
          </label>
        </div>

        {/* Tip Selector */}
        {showTipSelector && (
          <div className="flex gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            {[500, 1000, 2000, 5000].map((cents) => (
              <button
                key={cents}
                onClick={() => handleSendTip(cents)}
                className="flex-1 px-3 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/40 transition-all text-sm font-bold text-emerald-300"
              >
                ${(cents / 100).toFixed(0)}
              </button>
            ))}
          </div>
        )}

        {/* Gift Selector */}
        {showGiftSelector && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl">
            {gifts.map((gift) => (
              <button
                key={gift.id}
                onClick={() => handleSendGift(gift)}
                disabled={balance < gift.coin_cost}
                className="flex flex-col items-center gap-1.5 p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl hover:bg-pink-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-3xl">{gift.emoji}</span>
                <span className="text-[10px] text-pink-300 font-medium">{gift.coin_cost} coins</span>
              </button>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && canSend) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Type a message (${messageCost} coins)...`}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 text-white text-sm placeholder:text-white/40 transition-all"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!canSend || sending}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Low Balance Warning */}
        {balance < messageCost && (
          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Coins className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-amber-300">
              Not enough coins.{' '}
              <button onClick={onBuyCoins} className="underline font-bold hover:text-amber-200">
                Buy more
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
