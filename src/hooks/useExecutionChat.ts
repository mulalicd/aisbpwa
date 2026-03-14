import { useState, useCallback, useRef } from "react";

export interface ExecMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aisbs-chat`;

export function useExecutionChat() {
  const [messages, setMessages] = useState<ExecMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Always holds current messages — prevents stale closure in followUp
  const messagesRef = useRef<ExecMessage[]>([]);

  const stream = useCallback(async (
    allMessages: { role: string; content: string }[],
    mode: string = "execute",
    userApiKey?: string,
    userProvider?: string
  ) => {
    setIsLoading(true);
    const assistantId = crypto.randomUUID();
    let result = "";

    const upsert = (chunk: string) => {
      result += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        let next: ExecMessage[];
        if (last?.role === "assistant" && last.id === assistantId) {
          next = prev.map((m, i) => i === prev.length - 1 ? { ...m, content: result } : m);
        } else {
          next = [...prev, { id: assistantId, role: "assistant" as const, content: result }];
        }
        messagesRef.current = next;
        return next;
      });
    };

    try {
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, mode, userApiKey, userProvider }),
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { upsert("⚠️ Rate limit reached. Please try again shortly."); return result; }
        if (resp.status === 402) { upsert("⚠️ Credits exhausted. Please add credits."); return result; }
        throw new Error("Stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error(e);
        if (!result) upsert("Error executing prompt. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
    return result;
  }, []);

  const execute = useCallback(async (prompt: string, userData?: string, mode: string = "execute", userApiKey?: string, userProvider?: string) => {
    const fullPrompt = userData?.trim()
      ? `${prompt}\n\n--- USER PROVIDED DATA ---\n${userData}`
      : prompt;

    const userMsg: ExecMessage = { id: crypto.randomUUID(), role: "user", content: fullPrompt };
    messagesRef.current = [userMsg];
    setMessages([userMsg]);

    return stream([{ role: "user", content: fullPrompt }], mode, userApiKey, userProvider);
  }, [stream]);

  const followUp = useCallback(async (question: string) => {
    const userMsg: ExecMessage = { id: crypto.randomUUID(), role: "user", content: question };

    // Use messagesRef.current — always has the latest messages, no stale closure
    const currentMessages = messagesRef.current;
    const updatedMessages = [...currentMessages, userMsg];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);

    const allMsgs = updatedMessages.map(m => ({ role: m.role, content: m.content }));
    return stream(allMsgs, "execute");
  }, [stream]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    messagesRef.current = [];
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, execute, followUp, clear };
}
