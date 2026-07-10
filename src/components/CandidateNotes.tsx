import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Tag, X } from "lucide-react";
import {
  addCandidateNote,
  getCandidateNotes,
  updateCandidateNote,
  deleteCandidateNote,
  PREDEFINED_TAGS,
  type CandidateNote,
} from "@/lib/candidateNotesApi";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import { useToast } from "@/hooks/use-toast";

interface CandidateNotesProps {
  candidateId: string;
  candidateName: string;
}

const TAG_COLORS = {
  green: "bg-green-100 text-green-800 border-green-300",
  red: "bg-red-100 text-red-800 border-red-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
};

export function CandidateNotes({ candidateId, candidateName }: CandidateNotesProps) {
  const { session } = useEmployerAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<CandidateNote[]>(getCandidateNotes(candidateId));
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<typeof PREDEFINED_TAGS>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNote = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newNote = addCandidateNote(
        candidateId,
        session?.id || "",
        session?.email || "",
        session?.companyName || "Unknown",
        content,
        selectedTags
      );
      
      setNotes([newNote, ...notes]);
      setContent("");
      setSelectedTags([]);
      toast({
        title: "Success",
        description: "Note added successfully",
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    
    if (deleteCandidateNote(noteId)) {
      setNotes(notes.filter(n => n.id !== noteId));
      toast({
        title: "Success",
        description: "Note deleted",
      });
    }
  };

  const toggleTag = (tag: typeof PREDEFINED_TAGS[0]) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" data-testid={`button-notes-${candidateId}`}>
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Notes</span>
          {notes.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {notes.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid={`dialog-notes-${candidateId}`}>
        <DialogHeader>
          <DialogTitle>Team Notes - {candidateName}</DialogTitle>
          <DialogDescription>Collaborate with your team using shared notes and decision tags</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Note Section */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Team Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your observation or feedback..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none"
                rows={3}
                data-testid={`textarea-note-${candidateId}`}
              />

              {/* Tags Selection */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Decision Tags</p>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        selectedTags.some(t => t.id === tag.id)
                          ? TAG_COLORS[tag.color as keyof typeof TAG_COLORS]
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                      data-testid={`tag-${tag.id}-${candidateId}`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddNote}
                disabled={isLoading || !content.trim()}
                className="w-full"
                data-testid={`button-add-note-${candidateId}`}
              >
                {isLoading ? "Saving..." : "Add Note"}
              </Button>
            </CardContent>
          </Card>

          {/* Notes List */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Recent Notes ({notes.length})
            </h3>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <Card key={note.id} className="p-4 border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {note.addedByName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-6 w-6"
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground mb-3">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map(tag => (
                          <Badge
                            key={tag.id}
                            className={`text-xs ${TAG_COLORS[tag.color as keyof typeof TAG_COLORS]}`}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
