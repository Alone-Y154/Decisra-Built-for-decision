import { useState } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIPanelProps {
  scope?: string;
  context?: string;
}

interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIPanel({ scope }: AIPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Mock AI response - in production this would call the scoped AI
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on the decision scope "${scope}", here's a consideration: This requires weighing the immediate benefits against long-term implications. What specific aspect would you like to explore further?`,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Scoped AI</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Limited assistance, within scope only.
        </p>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">
              Use AI to clarify trade-offs, summarize viewpoints, or reframe the
              decision — within the defined scope.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              AI usage is limited during this session.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`text-sm ${
                message.role === "user"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span className="font-medium">
                {message.role === "user" ? "You: " : "AI: "}
              </span>
              {message.content}
            </div>
          ))
        )}

        {isLoading && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">AI: </span>
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something related to the decision scope…"
            className="min-h-[60px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Staying aligned with the scope helps keep this session focused.
        </p>
      </div>
    </div>
  );
}
