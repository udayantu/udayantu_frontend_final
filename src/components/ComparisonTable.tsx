import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, BarChart, IndianRupee, Building2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const programsData = [
  {
    name: "Business Development",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹3.5-5L",
    topCompanies: ["Byju's", "Zomato", "Swiggy"],
    keySkills: ["Sales", "Negotiation", "Client Relations"]
  },
  {
    name: "Customer Success",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹3-4.5L",
    topCompanies: ["Freshworks", "Zoho", "Razorpay"],
    keySkills: ["Support", "Communication", "Problem Solving"]
  },
  {
    name: "Project Management",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹4-6L",
    topCompanies: ["TCS", "Wipro", "Infosys"],
    keySkills: ["Agile", "Planning", "Leadership"]
  },
  {
    name: "Operations Management",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹4-6L",
    topCompanies: ["Amazon", "Flipkart", "Delhivery"],
    keySkills: ["Logistics", "Process", "Analytics"]
  },
  {
    name: "Product Management",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹5-7L",
    topCompanies: ["PhonePe", "Paytm", "Cred"],
    keySkills: ["Strategy", "UX", "Roadmapping"]
  },
  {
    name: "Human Resources",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹3.5-5L",
    topCompanies: ["HCL", "Tech Mahindra", "Accenture"],
    keySkills: ["Recruitment", "Compliance", "Engagement"]
  },
  {
    name: "Marketing Management",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹4-6L",
    topCompanies: ["Myntra", "Nykaa", "Urban Company"],
    keySkills: ["Digital Marketing", "SEO", "Analytics"]
  },
  {
    name: "Customer Support",
    duration: "15 weeks",
    difficulty: "Fresher",
    avgSalary: "₹2.5-4L",
    topCompanies: ["Ola", "Urban Company", "BigBasket"],
    keySkills: ["Communication", "Ticketing", "CRM"]
  }
];

export const ComparisonTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"register" | "login">("register");

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Compare <span className="text-primary">All Programs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect career path by comparing duration, salary, skills, and hiring partners
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Program</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Difficulty</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Avg. Salary</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Top Companies</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Key Skills</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {programsData.map((program, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-foreground">{program.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            {program.duration}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline"
                          className="w-fit bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                        >
                            <BarChart className="w-3 h-3 mr-1" />
                            {program.difficulty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="border-primary text-primary w-fit">
                            <IndianRupee className="w-3 h-3 mr-1" />
                            {program.avgSalary}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {program.topCompanies.map((company, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {company}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {program.keySkills.map((skill, idx) => (
                              <span key={idx} className="text-xs text-muted-foreground">
                                {skill}{idx < program.keySkills.length - 1 ? " •" : ""}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden grid gap-4">
            {programsData.map((program, index) => (
              <Card key={index} className="border-2 border-border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {program.duration}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                    >
                      <BarChart className="w-3 h-3 mr-1" />
                      {program.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-primary text-primary">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {program.avgSalary}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Top Hiring Companies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {program.topCompanies.map((company, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      Key Skills You'll Learn
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {program.keySkills.join(" • ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => {
                if (user) {
                  navigate("/payment");
                } else {
                  setAuthDefaultTab("register");
                  setIsAuthOpen(true);
                }
              }}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Check className="mr-2 w-5 h-5" />
              Choose Your Program & Register
            </Button>
          </div>
        </div>
      </section>

      <AuthModal 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen}
        defaultTab={authDefaultTab}
      />
    </>
  );
};