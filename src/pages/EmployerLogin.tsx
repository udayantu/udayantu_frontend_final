import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, ArrowLeft, ShieldCheck } from "lucide-react";

const EmployerLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center py-20 px-4 z-10">
        <Card className="max-w-xl w-full border border-slate-800 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-8 relative overflow-hidden">
          {/* Top accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600" />
          
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Rocket className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 select-none">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Access Launching Soon
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Employer Portal Coming Soon
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
              We are currently preparing secure, credentials-governed workspaces for our partner recruiters and team-interviewers. Direct portal sign-in is disabled.
            </p>
          </div>

          {/* Onboarding steps */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left py-2">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 space-y-1">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">Phase 1</span>
              <p className="text-xs font-bold text-slate-200">Join Waitlist</p>
              <p className="text-[10px] text-slate-400">Secure early hiring priority</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 space-y-1">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">Phase 2</span>
              <p className="text-xs font-bold text-slate-200">Get Activated</p>
              <p className="text-[10px] text-slate-400">Admin registers company email</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              onClick={() => navigate("/employers")}
              className="w-full sm:w-auto px-6 py-5 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-all text-xs"
            >
              Join Waitlist
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-5 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 font-bold rounded-xl transition-all text-xs gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Go Back
            </Button>
          </div>

          <p className="text-[10px] text-slate-500 font-medium">
            Contact us at <a href="mailto:support@udayantu.com" className="text-sky-400 hover:underline">support@udayantu.com</a> for early beta requests.
          </p>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EmployerLogin;
