import ChatManager from "@/components/chatManager/charManger";
import ChatMessages from "@/components/chatManager/chatMessages";
import ChatInput from "@/components/chatManager/chatInput";

export default function ChatPage() {
  return (
    <main className="bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] h-full w-full rounded-[10px]">
      <section
        about="central"
        className="flex flex-col relative h-full bg-white dark:bg-[#0B0B0C] w-full rounded-[10px] shadow-sm overflow-hidden"
      >
        <ChatManager>
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden min-h-0 bg-white dark:bg-[#0B0B0C] w-full">
              <ChatMessages />
            </div>
            <div className="flex-shrink-0">
              <ChatInput />
            </div>
          </div>
        </ChatManager>
      </section>
    </main>
  );
}
