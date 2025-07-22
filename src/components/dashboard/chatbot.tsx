"use client"
import { useState } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { runAnswerEventQuestions } from "@/app/actions";

interface Message {
  text: string;
  isUser: boolean;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await runAnswerEventQuestions({ question: input });
      const botMessage: Message = { text: result.answer, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { text: "Sorry, I couldn't get an answer. Please try again.", isUser: false };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg">
          <Bot className="w-8 h-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-end gap-2 ${message.isUser ? "justify-end" : ""}`}>
                  {!message.isUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-[80%] ${message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                   {message.isUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-end gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="py-2 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
