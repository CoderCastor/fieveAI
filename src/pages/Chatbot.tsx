import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Send,
  Loader2,
  Globe,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [language, setLanguage] = useState("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7777";

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error: any) {
      console.error("Failed to load chat history:", error);
      // Don't show error toast on mount - just start fresh
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/chatbot/chat`,
        {
          message: input,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const aiMessage: Message = {
          role: "assistant",
          content: response.data.response,
          created_at: response.data.timestamp,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.error || "Failed to get response");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || error.message || "Failed to send message"
      );
      // Remove the user message if failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/api/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error: any) {
      toast.error("Failed to clear history");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/patient-dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={clearHistory}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">AI Symptom Assistant</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>Powered by SiliconFlow AI</span>
            </div>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">
                      Start a conversation with your AI health assistant
                    </p>
                    <p className="text-xs mt-2">
                      Ask about your symptoms, medications, or fever management
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-slide-up`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder={`Type your message in ${
                language === "hi"
                  ? "Hindi"
                  : language === "kn"
                  ? "Kannada"
                  : "English"
              }...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
              disabled={loading || loadingHistory}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || loadingHistory || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
