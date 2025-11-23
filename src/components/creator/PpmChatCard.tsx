import { useState } from 'react';
import { MessageCircle, Coins, Send, Star, DollarSign, Gift as GiftIcon } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">Direct Message</h3>
          <InfoTooltip content="Send paid messages directly to the creator. Each message costs coins. Priority messages (20 coins) get highlighted for better visibility." />
        </div>
        <button
          onClick={onBuyCoins}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
        >
          <Coins className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">{balance}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-500 text-center">
              Start a conversation<br />
              <span className="text-xs">10 coins per message</span>
            </p>
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
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {msg.is_priority && (
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-semibold">Priority</span>
                    </div>
                  )}

                  {msg.gift_emoji && (
                    <div className="text-3xl mb-1">{msg.gift_emoji}</div>
                  )}

                  {msg.tip_cents > 0 && (
                    <div className="flex items-center gap-1 mb-1 text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">
                        ${(msg.tip_cents / 100).toFixed(2)} tip
                      </span>
                    </div>
                  )}

                  {msg.text && <p className="text-sm">{msg.text}</p>}

                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-500'}`}>
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

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTipSelector(!showTipSelector)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="Send tip"
          >
            <DollarSign className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setShowGiftSelector(!showGiftSelector)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="Send gift"
          >
            <GiftIcon className="w-5 h-5 text-slate-600" />
          </button>

          <label className="flex items-center gap-1.5 ml-auto text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="rounded"
            />
            <Star className="w-3 h-3" />
            Priority (+10 coins)
          </label>
        </div>

        {showTipSelector && (
          <div className="flex gap-2 p-2 bg-slate-50 rounded-xl">
            {[500, 1000, 2000, 5000].map((cents) => (
              <button
                key={cents}
                onClick={() => handleSendTip(cents)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors text-sm font-semibold"
              >
                ${(cents / 100).toFixed(0)}
              </button>
            ))}
          </div>
        )}

        {showGiftSelector && (
          <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl">
            {gifts.map((gift) => (
              <button
                key={gift.id}
                onClick={() => handleSendGift(gift)}
                disabled={balance < gift.coin_cost}
                className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">{gift.emoji}</span>
                <span className="text-[10px] text-slate-600">{gift.coin_cost} coins</span>
              </button>
            ))}
          </div>
        )}

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
            placeholder={`Message (${messageCost} coins)`}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            disabled={!canSend || sending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {balance < messageCost && (
          <p className="text-xs text-amber-600 text-center">
            Not enough coins. <button onClick={onBuyCoins} className="underline font-semibold">Buy more</button>
          </p>
        )}
      </div>
    </div>
  );
}
