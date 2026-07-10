import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Loader2 } from "lucide-react";
import { jobPostingSchema, JobPosting } from "@/lib/jobPostingSchema";
import { saveJob, getAllJobTemplates } from "@/lib/jobStorage";
import { useToast } from "@/hooks/use-toast";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";

interface JobPostingFormProps {
  companyId: string;
  onSuccess?: (job: JobPosting) => void;
  onCancel?: () => void;
  useTemplate?: string;
}

export const JobPostingForm = ({ companyId, onSuccess, onCancel, useTemplate }: JobPostingFormProps) => {
  const { toast } = useToast();
  const { checkPermission } = useEmployerAuth();
  
  // Permission check
  if (!checkPermission("manage_candidates")) {
    return (
      <Card className="p-8 text-center border">
        <p className="text-destructive font-semibold mb-3">Access Denied</p>
        <p className="text-muted-foreground mb-4">You don't have permission to post jobs. Contact your admin.</p>
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            Go Back
          </Button>
        )}
      </Card>
    );
  }
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [toolInput, setToolInput] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobPosting>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      companyId,
      skills: [],
      tools: [],
      workType: "full-time",
      languageLevel: "intermediate",
    },
  });

  const languageLevel = watch("languageLevel");
  const workType = watch("workType");

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue("skills", newSkills);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    setValue("skills", newSkills);
  };

  const handleAddTool = () => {
    if (toolInput.trim()) {
      const newTools = [...tools, toolInput.trim()];
      setTools(newTools);
      setValue("tools", newTools);
      setToolInput("");
    }
  };

  const handleRemoveTool = (index: number) => {
    const newTools = tools.filter((_, i) => i !== index);
    setTools(newTools);
    setValue("tools", newTools);
  };

  const onSubmit = async (data: JobPosting) => {
    setIsLoading(true);
    try {
      const job = saveJob(data);
      toast({ description: "Job posted successfully!" });
      
      if (saveAsTemplate && templateName.trim()) {
        // Save as template - to be implemented
        console.log("Saving template:", templateName);
      }
      
      onSuccess?.(job);
    } catch (error) {
      toast({ description: "Failed to post job", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 border max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Job Title */}
        <div>
          <Label className="font-semibold mb-2 block">Job Title</Label>
          <Input
            {...register("title")}
            placeholder="e.g., Junior Software Developer"
            className="border-border"
            data-testid="input-job-title"
          />
          {errors.title && <span className="text-sm text-destructive">{errors.title.message}</span>}
        </div>

        {/* Location & Work Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="font-semibold mb-2 block">Location</Label>
            <Input
              {...register("location")}
              placeholder="e.g., Bangalore, Remote"
              className="border-border"
              data-testid="input-location"
            />
            {errors.location && <span className="text-sm text-destructive">{errors.location.message}</span>}
          </div>

          <div>
            <Label className="font-semibold mb-2 block">Work Type</Label>
            <Select value={workType} onValueChange={(val) => setValue("workType", val as any)}>
              <SelectTrigger data-testid="select-work-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-semibold mb-2 block">Language Level</Label>
            <Select value={languageLevel} onValueChange={(val) => setValue("languageLevel", val as any)}>
              <SelectTrigger data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Salary Band */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold mb-2 block">Min Salary (₹/year)</Label>
            <Input
              type="number"
              {...register("salaryBandMin", { valueAsNumber: true })}
              placeholder="300000"
              className="border-border"
              data-testid="input-salary-min"
            />
            {errors.salaryBandMin && <span className="text-sm text-destructive">{errors.salaryBandMin.message}</span>}
          </div>

          <div>
            <Label className="font-semibold mb-2 block">Max Salary (₹/year)</Label>
            <Input
              type="number"
              {...register("salaryBandMax", { valueAsNumber: true })}
              placeholder="600000"
              className="border-border"
              data-testid="input-salary-max"
            />
            {errors.salaryBandMax && <span className="text-sm text-destructive">{errors.salaryBandMax.message}</span>}
          </div>
        </div>

        {/* Skills */}
        <div>
          <Label className="font-semibold mb-2 block">Required Skills</Label>
          <div className="flex gap-2 mb-3">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
              placeholder="Add skill and press Enter"
              className="border-border"
              data-testid="input-skill"
            />
            <Button type="button" size="sm" onClick={handleAddSkill} data-testid="button-add-skill">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary rounded-full text-sm"
                data-testid={`tag-skill-${idx}`}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="hover:text-destructive"
                  data-testid={`button-remove-skill-${idx}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {errors.skills && <span className="text-sm text-destructive">{errors.skills.message}</span>}
        </div>

        {/* Tools */}
        <div>
          <Label className="font-semibold mb-2 block">Required Tools</Label>
          <div className="flex gap-2 mb-3">
            <Input
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTool()}
              placeholder="Add tool and press Enter"
              className="border-border"
              data-testid="input-tool"
            />
            <Button type="button" size="sm" onClick={handleAddTool} data-testid="button-add-tool">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-accent-bg/30 border border-border rounded-full text-sm"
                data-testid={`tag-tool-${idx}`}
              >
                <span>{tool}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTool(idx)}
                  className="hover:text-destructive"
                  data-testid={`button-remove-tool-${idx}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {errors.tools && <span className="text-sm text-destructive">{errors.tools.message}</span>}
        </div>

        {/* Description */}
        <div>
          <Label className="font-semibold mb-2 block">Job Description (Optional)</Label>
          <Textarea
            {...register("description")}
            placeholder="Add detailed job description..."
            className="border-border min-h-[120px]"
            data-testid="textarea-description"
          />
        </div>

        {/* Save as Template */}
        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              data-testid="checkbox-save-template"
            />
            <span className="text-sm font-medium">Save as template for future use</span>
          </label>

          {saveAsTemplate && (
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name (e.g., Junior Developer Template)"
              className="border-border"
              data-testid="input-template-name"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-secondary hover:bg-secondary/90"
            data-testid="button-submit-job"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Job"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
