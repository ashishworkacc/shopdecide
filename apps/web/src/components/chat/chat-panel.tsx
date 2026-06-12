'use client'
import { useRef, useEffect, useState, type KeyboardEvent } from 'react'
import type { Product, ChatMessage } from '@/lib/types'

interface Props {
  products: Product[]
  chatMessages: ChatMessage[]
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  isRefining: boolean
  setIsRefining: React.Dispatch<React.SetStateAction<boolean>>
  onReorder: (ids: string[]) => void
}

export function ChatPanel({
  products,
  chatMessages,
  setChatMessages,
  isRefining,
  setIsRefining,
  onReorder,
}: Props) {
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isRefining])

  async function sendMessage() {
    const text = inputText.trim()
    if (!text || isRefining) return

    setInputText('')
    setChatMessages(prev => [...prev, { type: 'user', text }])
    setIsRefining(true)

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            price: p.price,
            batteryScore: p.batteryScore,
            ancScore: p.ancScore,
            waterScore: p.waterScore,
            redditMentions: p.redditMentions,
            amazonReviews: p.amazonReviews,
            flipkartReviews: p.flipkartReviews,
          })),
          chatHistory: chatMessages,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setChatMessages(prev => [...prev, { type: 'ai', text: data.aiText }])
        if (data.reorderedIds?.length > 0) {
          onReorder(data.reorderedIds)
        }
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        { type: 'ai', text: "Sorry, I couldn't process that. Please try again." },
      ])
    } finally {
      setIsRefining(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      style={{
        width: 380,
        flexShrink: 0,
        borderLeft: '1.5px solid #e8ddd0',
        display: 'flex',
        flexDirection: 'column',
        background: '#fef9f0',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1.5px solid #e8ddd0',
          background: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: '#f97316',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1c0a00' }}>Refine with AI</div>
            <div style={{ fontSize: 11, color: '#9a7e68' }}>Tell me what matters to you</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: msg.type === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.type === 'user' ? '#f97316' : 'white',
                color: msg.type === 'user' ? 'white' : '#1c0a00',
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: msg.type === 'ai' ? '1px solid #e8ddd0' : 'none',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isRefining && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '14px 14px 14px 4px',
                background: 'white',
                border: '1px solid #e8ddd0',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
              }}
            >
              {[0, 0.3, 0.6].map(delay => (
                <div
                  key={delay}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#f97316',
                    animation: `bounce 1.4s ${delay}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1.5px solid #e8ddd0',
          background: 'white',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
        }}
      >
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. I need better battery life…"
          disabled={isRefining}
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            border: '1.5px solid #e8ddd0',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            color: '#1c0a00',
            background: isRefining ? '#f5f0ea' : 'white',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isRefining || !inputText.trim()}
          style={{
            background: isRefining || !inputText.trim() ? '#e8ddd0' : '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            width: 40,
            height: 40,
            fontSize: 18,
            cursor: isRefining || !inputText.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginBottom: 2,
          }}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
