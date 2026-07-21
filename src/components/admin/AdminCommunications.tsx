import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, MessageSquare, Mail, MessageCircle, CheckCircle, 
  AlertCircle, Search, SlidersHorizontal, Plus, Loader2, Sparkles
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommMessage {
  id: string;
  recipient_name: string;
  recipient_role: "Student" | "Employer" | "Instructor";
  channel: "SMS" | "Email" | "WhatsApp";
  message_preview: string;
  status: "Delivered" | "Failed" | "Pending";
  created_at: string;
}

export function AdminCommunications() {
  const [messages, setMessages] = useState<CommMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const { toast } = useToast();

  // Wizard fields
  const [targetGroup, setTargetGroup] = useState("students");
  const [selectedChannel, setSelectedChannel] = useState<"SMS" | "Email" | "WhatsApp">("SMS");
  const [wizardMessage, setWizardMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("udayantu_communications");
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      setMessages([]);
    }
  }, []);

  const handleSendBroadcast = () => {
    if (!wizardMessage.trim()) {
      toast({
        title: "Blank Message",
        description: "Please write a broadcast message first.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const recipientName = targetGroup === "students" ? "All Students Broadcaster" : 
                            targetGroup === "employers" ? "All Employers Network" : "All Instructors";
      const recipientRole = targetGroup === "students" ? "Student" : 
                            targetGroup === "employers" ? "Employer" : "Instructor";

      const newMessage: CommMessage = {
        id: "c_" + Date.now(),
        recipient_name: recipientName,
        recipient_role: recipientRole as any,
        channel: selectedChannel,
        message_preview: wizardMessage.substring(0, 100) + (wizardMessage.length > 100 ? "..." : ""),
        status: "Delivered",
        created_at: new Date().toISOString()
      };

      const updated = [newMessage, ...messages];
      setMessages(updated);
      localStorage.setItem("udayantu_communications", JSON.stringify(updated));

      toast({
        title: "Broadcast Dispatched",
        description: `Successfully sent ${selectedChannel} to all ${targetGroup}.`
      });

      setWizardMessage("");
      setIsSending(false);
    }, 800);
  };

  const getFilteredMessages = () => {
    return messages.filter(msg => {
      const matchesSearch = msg.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            msg.message_preview.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChannel = channelFilter === "all" || msg.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  };

  const smsCount = messages.filter(m => m.channel === "SMS").length;
  const emailCount = messages.filter(m => m.channel === "Email").length;
  const whatsappCount = messages.filter(m => m.channel === "WhatsApp").length;
  const failedCount = messages.filter(m => m.status === "Failed").length;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "SMS":
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1E3A63] tracking-tight">Communications Center</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Coordinate SMS broadcasting, WhatsApp templates, and system email campaigns.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Total SMS Sent</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">{smsCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live dispatches</span>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Emails Dispatched</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">{emailCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live dispatches</span>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">WhatsApp Messages</span>
          <span className="text-2xl font-black text-[#1E3A63] block mt-1">{whatsappCount}</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live dispatches</span>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-4">
          <span className="text-xs font-bold text-slate-400 block">Failed/Bounced</span>
          <span className="text-2xl font-black text-red-600 block mt-1">{failedCount}</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1 block">Action required</span>
        </Card>
      </div>

      {/* Grid splits into wizard and logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Broadcast wizard */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 md:col-span-1 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-extrabold text-[#1E3A63] flex items-center gap-2 pb-3 border-b border-slate-50">
              <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
              New Broadcast Campaign
            </CardTitle>
            
            <div className="space-y-4 pt-4 text-xs font-semibold text-slate-600">
              {/* Recipient selection */}
              <div className="space-y-1">
                <Label>Recipient Target Group</Label>
                <Select value={targetGroup} onValueChange={setTargetGroup}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">All Registered Students</SelectItem>
                    <SelectItem value="employers">All Registered Employers</SelectItem>
                    <SelectItem value="teachers">All Course Instructors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Channel */}
              <div className="space-y-1">
                <Label>Delivery Channel</Label>
                <Select value={selectedChannel} onValueChange={(val: any) => setSelectedChannel(val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMS">SMS Gateway (FastOTP)</SelectItem>
                    <SelectItem value="Email">Email (SendGrid API)</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp Business Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message block */}
              <div className="space-y-1">
                <Label>Message Content</Label>
                <Textarea 
                  rows={4} 
                  placeholder="Type your announcement, reminder, or OTP custom text here..."
                  value={wizardMessage}
                  onChange={e => setWizardMessage(e.target.value)}
                  className="font-medium text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-50">
            <Button 
              onClick={handleSendBroadcast} 
              disabled={isSending}
              className="w-full bg-[#1E3A63] hover:bg-[#1E3A63]/90 text-white font-semibold text-xs gap-1.5 h-9 rounded-xl shadow-xs"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Broadcast
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Right Side: Message logs list */}
        <Card className="shadow-sm border-slate-100 rounded-2xl bg-white p-5 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-base font-extrabold text-[#1E3A63]">Recent Dispatches Log</span>
            
            {/* Search and Channel Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <Input 
                  placeholder="Filter logs..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs w-[130px]"
                />
              </div>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-8 text-xs w-[100px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Recipient</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Channel</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Message Preview</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3 text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold text-[#5B759E] uppercase tracking-wider py-3">Time Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredMessages().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-8 font-semibold">
                      No matching log entries.
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredMessages().map(msg => (
                    <TableRow key={msg.id} className="border-b border-slate-50">
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block">{msg.recipient_name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{msg.recipient_role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-600 text-xs">
                          {getChannelIcon(msg.channel)}
                          {msg.channel}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-500 max-w-[200px] truncate" title={msg.message_preview}>
                        {msg.message_preview}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge className={`text-[10px] font-bold rounded px-1.5 py-0.2 border ${
                          msg.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          msg.status === "Failed" ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-400 font-semibold">
                        {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
