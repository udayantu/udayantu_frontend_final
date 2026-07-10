/**
 * Data Parity Check Component
 * Validates data consistency across dashboards
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParityCheck, useEventReplay, useDashboardMetrics, usePlacementFunnel } from "@/hooks/useUnifiedModels";
import { CheckCircle2, AlertTriangle, RefreshCw, Play, BarChart3, Users, Briefcase } from "lucide-react";

export function DataParityCheck() {
  const { isChecking, parityResult, runParityCheck } = useParityCheck();
  const { isReplaying, replayResult, replayLastWeek } = useEventReplay();
  const { data: dashboardMetrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: funnelData, isLoading: funnelLoading } = usePlacementFunnel();

  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data Consistency Check
              </CardTitle>
              <CardDescription>
                Verify data parity across Student, Employer, and Admin dashboards
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={runParityCheck}
                disabled={isChecking}
                data-testid="button-run-parity-check"
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Run Parity Check
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={replayLastWeek}
                disabled={isReplaying}
                data-testid="button-replay-events"
              >
                {isReplaying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Replay Last Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {parityResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {parityResult.isValid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      All metrics are consistent across dashboards
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      {parityResult.discrepancies.length} discrepancies found
                    </span>
                  </>
                )}
              </div>

              {!parityResult.isValid && parityResult.discrepancies.length > 0 && (
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDetails(!showDetails)}
                    data-testid="button-toggle-discrepancy-details"
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </Button>
                  
                  {showDetails && (
                    <div className="mt-2 border rounded-md p-3 bg-muted/50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left pb-2">Metric</th>
                            <th className="text-right pb-2">Student</th>
                            <th className="text-right pb-2">Employer</th>
                            <th className="text-right pb-2">Admin</th>
                            <th className="text-right pb-2">Diff</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parityResult.discrepancies.map((d, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="py-2">{d.metric}</td>
                              <td className="text-right">{d.studentDashboard}</td>
                              <td className="text-right">{d.employerDashboard}</td>
                              <td className="text-right">{d.adminDashboard}</td>
                              <td className="text-right text-destructive font-medium">
                                {d.difference}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {replayResult && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm">
                Event Replay Complete: <strong>{replayResult.replayed}</strong> events replayed
                {replayResult.errors > 0 && (
                  <span className="text-destructive ml-2">
                    ({replayResult.errors} errors)
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Student Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="animate-pulse h-20 bg-muted rounded" />
            ) : dashboardMetrics ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="font-medium">{dashboardMetrics.studentMetrics.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrolled (Paid)</span>
                  <span className="font-medium">{dashboardMetrics.studentMetrics.paid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Training</span>
                  <span className="font-medium">{dashboardMetrics.studentMetrics.inTraining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Placed</span>
                  <Badge variant="secondary">{dashboardMetrics.studentMetrics.placed}</Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Placement Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <div className="animate-pulse h-20 bg-muted rounded" />
            ) : funnelData ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrolled</span>
                  <span className="font-medium">{funnelData.enrolled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Complete</span>
                  <span className="font-medium">{funnelData.trainingCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interviewed</span>
                  <span className="font-medium">{funnelData.interviewed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <Badge variant="secondary">{funnelData.joined}</Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <div className="animate-pulse h-20 bg-muted rounded" />
            ) : funnelData ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrolled to Training</span>
                  <span className="font-medium">{funnelData.conversionRates.enrolledToTraining}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interview to Offer</span>
                  <span className="font-medium">{funnelData.conversionRates.interviewToOffer}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer to Join</span>
                  <span className="font-medium">{funnelData.conversionRates.offerToJoin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Placement</span>
                  <Badge>{funnelData.conversionRates.overallPlacement}%</Badge>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
