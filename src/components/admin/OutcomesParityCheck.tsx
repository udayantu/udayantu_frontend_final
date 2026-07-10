/**
 * Outcomes Parity Check Component
 * Validates data consistency across Admin, SS, CS dashboards
 * Includes historical reconciliation for last 30 days
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParityValidation, useHistoricalReconciliation } from "@/hooks/useOutcomes";
import { CheckCircle2, AlertTriangle, RefreshCw, Play, BarChart3 } from "lucide-react";

interface OutcomesParityCheckProps {
  language?: "en" | "hi";
}

const text = {
  en: {
    title: "Outcomes Parity Validation",
    subtitle: "Verify data consistency across Admin, SS, and CS dashboards",
    runCheck: "Run Parity Check",
    reconcile: "Reconcile (30 days)",
    allConsistent: "All metrics are consistent across dashboards",
    discrepanciesFound: "discrepancies found",
    metric: "Metric",
    admin: "Admin",
    ss: "SS",
    cs: "CS",
    diff: "Diff",
    reconcileComplete: "Reconciliation Complete",
    eventsChecked: "Events Checked",
    discrepancies: "Discrepancies",
    reconciled: "Reconciled",
    yes: "Yes",
    no: "No",
  },
  hi: {
    title: "आउटकम डेटा जांच",
    subtitle: "Admin, SS, CS में डेटा मिलान करें",
    runCheck: "जांच करें",
    reconcile: "मिलान (30 दिन)",
    allConsistent: "सभी आंकड़े मिलते हैं",
    discrepanciesFound: "अंतर मिले",
    metric: "मेट्रिक",
    admin: "एडमिन",
    ss: "SS",
    cs: "CS",
    diff: "अंतर",
    reconcileComplete: "मिलान पूरा",
    eventsChecked: "जांचे गए इवेंट",
    discrepancies: "अंतर",
    reconciled: "मिलान",
    yes: "हां",
    no: "नहीं",
  },
};

export function OutcomesParityCheck({ language = "hi" }: OutcomesParityCheckProps) {
  const { result: parityResult, isChecking, runCheck } = useParityValidation();
  const { result: reconcileResult, isReconciling, reconcile } = useHistoricalReconciliation();
  const [showDetails, setShowDetails] = useState(false);

  const t = text[language];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.title}
              </CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={runCheck}
                disabled={isChecking}
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {t.runCheck}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reconcile(30)}
                disabled={isReconciling}
              >
                {isReconciling ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {t.reconcile}
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
                      {t.allConsistent}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      {parityResult.discrepancies.length} {t.discrepanciesFound}
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
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </Button>

                  {showDetails && (
                    <div className="mt-2 border rounded-md p-3 bg-muted/50 overflow-x-auto">
                      <table className="w-full text-sm min-w-[400px]">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left pb-2">{t.metric}</th>
                            <th className="text-right pb-2">{t.admin}</th>
                            <th className="text-right pb-2">{t.ss}</th>
                            <th className="text-right pb-2">{t.cs}</th>
                            <th className="text-right pb-2">{t.diff}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parityResult.discrepancies.map((d, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="py-2">{d.metric}</td>
                              <td className="text-right">{d.adminValue}</td>
                              <td className="text-right">{d.ssValue}</td>
                              <td className="text-right">{d.csValue}</td>
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

          {reconcileResult && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-2">{t.reconcileComplete}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t.eventsChecked}:</span>
                  <span className="font-medium ml-2">{reconcileResult.eventsChecked}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t.discrepancies}:</span>
                  <span className="font-medium ml-2">{reconcileResult.discrepancies}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t.reconciled}:</span>
                  <Badge variant={reconcileResult.reconciled ? "default" : "destructive"} className="ml-2">
                    {reconcileResult.reconciled ? t.yes : t.no}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
