"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Trophy,
  Sparkles,
  BrainCircuit,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Positions", href: "/positions", icon: Briefcase },
  { name: "Rankings", href: "/rankings", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 flex flex-col">
      {/* Logo / Brand */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-white/5">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5">
            <Sparkles className="h-2.5 w-2.5 text-indigo-400" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-white tracking-tight">
            AI Recruit
          </h1>
          <p className="text-[9px] text-white/40 tracking-wide">
            Recruitment Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-0.5">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2} />
                <span className="font-semibold">{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-1 w-1 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </div>

        {/* AI Tools Section */}
        <div>
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              AI Tools
            </p>
          </div>
          <div className="space-y-0.5">
            <Link
              href="/candidates"
              className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-all"
            >
              <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>AI Evaluation</span>
            </Link>
            <Link
              href="/candidates"
              className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-all"
            >
              <BrainCircuit className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>Interview Assistant</span>
            </Link>
          </div>
        </div>

        {/* Reports Section */}
        <div>
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Reports
            </p>
          </div>
          <div className="space-y-0.5">
            <Link
              href="/rankings"
              className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-all"
            >
              <FileText className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>Reports</span>
            </Link>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Settings
            </p>
          </div>
          <div className="space-y-0.5">
            <button className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
              <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>Settings</span>
            </button>
            <button className="w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
              <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
              <span>User Guide</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* AI Branding */}
        <div className="relative px-3 py-3 rounded-xl bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-indigo-600/10 border border-indigo-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse" />
              <p className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
                AI Hiring Intelligence
              </p>
            </div>
            <p className="text-[9px] text-white/50">
              Powered by advanced AI models
            </p>
          </div>
        </div>

        {/* User Profile */}
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-all group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            N
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-semibold text-white">Naveed</p>
            <p className="text-[10px] text-white/40">Hiring Manager</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white/60" />
        </button>
      </div>
    </aside>
  );
}
