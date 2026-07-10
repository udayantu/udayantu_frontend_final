import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AnalyticsConfig {
  gaId: string;
  metaPixelId: string;
  searchConsoleId: string;
}

interface ConfigRecord {
  analytics?: AnalyticsConfig;
  [key: string]: unknown;
}

interface ConfigData {
  config: ConfigRecord;
  id?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function AdminIntegrations() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AnalyticsConfig>({
    gaId: "",
    metaPixelId: "",
    searchConsoleId: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from("configs")
        .select("config")
        .single() as { data: ConfigData | null };

      if (data?.config && typeof data.config === 'object' && 'analytics' in data.config) {
        const analytics = data.config.analytics as AnalyticsConfig | undefined;
        if (analytics) {
          setConfig({
            gaId: analytics.gaId || "",
            metaPixelId: analytics.metaPixelId || "",
            searchConsoleId: analytics.searchConsoleId || "",
          });
        }
      }
    } catch (error) {
      // Config doesn't exist yet, that's okay
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get existing config
      const { data: existingConfig } = await supabase
        .from("configs")
        .select("config, id")
        .single() as { data: ConfigData | null };

      const currentConfig = (existingConfig?.config && typeof existingConfig.config === 'object') 
        ? (existingConfig.config as ConfigRecord)
        : {} as ConfigRecord;

      const updatedConfig = {
        ...currentConfig,
        analytics: {
          gaId: config.gaId,
          metaPixelId: config.metaPixelId,
          searchConsoleId: config.searchConsoleId,
        },
      };

      // Update or insert
      if (existingConfig?.id) {
        const { error: updateError } = await supabase
          .from("configs")
          .update({ config: updatedConfig as any })
          .eq("id", existingConfig.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("configs")
          .insert({ config: updatedConfig as any });
        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Analytics configuration updated successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Third-Party Integrations</CardTitle>
        <CardDescription>
          Configure Google Analytics 4, Meta Pixel, and Search Console tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gaId">Google Analytics 4 Measurement ID</Label>
            <Input
              id="gaId"
              placeholder="G-XXXXXXXXXX"
              value={config.gaId}
              onChange={(e) => setConfig({ ...config, gaId: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Find your Measurement ID in Google Analytics 4 under Admin → Data Streams
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
            <Input
              id="metaPixelId"
              placeholder="1234567890"
              value={config.metaPixelId}
              onChange={(e) =>
                setConfig({ ...config, metaPixelId: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Find your Pixel ID in Meta Events Manager
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchConsoleId">Google Search Console Property</Label>
            <Input
              id="searchConsoleId"
              placeholder="https://yoursite.com"
              value={config.searchConsoleId}
              onChange={(e) =>
                setConfig({ ...config, searchConsoleId: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Your verified property URL in Google Search Console
            </p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Analytics Configuration
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="font-semibold">Setup Instructions:</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong>Google Analytics 4:</strong>
              <ol className="list-decimal list-inside ml-4 mt-1">
                <li>Go to analytics.google.com</li>
                <li>Navigate to Admin → Data Streams</li>
                <li>Copy your Measurement ID (starts with G-)</li>
              </ol>
            </div>
            <div>
              <strong>Meta Pixel:</strong>
              <ol className="list-decimal list-inside ml-4 mt-1">
                <li>Go to business.facebook.com/events_manager</li>
                <li>Select your pixel or create a new one</li>
                <li>Copy the Pixel ID from the settings</li>
              </ol>
            </div>
            <div>
              <strong>Google Search Console:</strong>
              <ol className="list-decimal list-inside ml-4 mt-1">
                <li>Go to search.google.com/search-console</li>
                <li>Add and verify your property</li>
                <li>Enter your verified property URL here</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
