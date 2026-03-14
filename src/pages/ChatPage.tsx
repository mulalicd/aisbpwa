import { AppLayout } from "@/components/AppLayout";
import { ChatPanel } from "@/components/ChatPanel";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ChatPage() {
  useDocumentTitle("AI Assistant");
  return (
    <AppLayout>
      <div className="flex-1 h-[calc(100vh-49px)] overflow-hidden">
        <ChatPanel />
      </div>
    </AppLayout>
  );
}
