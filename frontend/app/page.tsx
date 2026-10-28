"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  DollarSign, 
  Clock, 
  Users, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  Search,
  Sun,
  Moon,
  Square,
  Trash2,
  Download
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Dynamic API base URL: Uses NEXT_PUBLIC_API_URL on cloud (Render/Vercel) or localhost:8000 on local dev
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface KPI {
  month: string;
  total_employees: number;
  total_payout: number;
  total_hours: number;
  total_overtime_hours: number;
}

interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  hours_logged: number;
  hourly_rate: number;
  regular_hours: number;
  regular_pay?: number;
  overtime_hours: number;
  overtime_pay?: number;
  gross_salary: number;
  tax_deduction: number;
  net_salary: number;
  status: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export default function CEODashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Fetch KPIs and Payroll data from FastAPI
  const loadData = () => {
    setLoadingData(true);
    Promise.all([
      fetch(`${API_BASE}/api/kpis`).then((res) => res.json()),
      fetch(`${API_BASE}/api/payroll`).then((res) => res.json())
    ])
      .then(([kpiData, payrollData]) => {
        setKpis(kpiData);
        setEmployees(payrollData);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading payroll data:", err);
        setLoadingData(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Performance Optimization: useMemo avoids recalculating filtering on unrelated renders
  const filteredEmployees = useMemo(() => {
    if (!searchFilter.trim()) return employees;
    const query = searchFilter.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
    );
  }, [employees, searchFilter]);

  // =====================================================================
  // 1-CLICK PDF REPORT DOWNLOAD
  // Generates and downloads a clean, professional PDF report directly
  // =====================================================================
  const downloadPDFReport = () => {
    if (employees.length === 0) return;

    // Landscape orientation provides plenty of horizontal space for payroll columns
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    // 1. Company Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text("NuGenova Technologies - Payroll Report", 40, 45);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Disbursement Period: October 2026   |   Generated: ${new Date().toLocaleDateString()}`, 40, 62);

    // 2. Executive KPI Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, 75, 762, 38, 6, 6, "FD");

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const totalPayoutStr = kpis ? `$${kpis.total_payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00";
    const totalHoursStr = kpis ? `${kpis.total_hours} hrs` : "0 hrs";
    const totalOvertimeStr = kpis ? `${kpis.total_overtime_hours} hrs` : "0 hrs";
    const activeMembers = kpis ? `${kpis.total_employees}` : `${employees.length}`;

    doc.text(
      `Total Net Payout: ${totalPayoutStr}     |     Total Hours Logged: ${totalHoursStr}     |     Overtime Logged: ${totalOvertimeStr}     |     Active Team Members: ${activeMembers}`,
      55,
      98
    );

    // 3. Table Headers (Audit status removed as requested!)
    const headers = [
      [
        "ID",
        "Employee Name",
        "Role",
        "Hours",
        "Rate ($/hr)",
        "Regular Pay",
        "Overtime (h)",
        "Overtime Pay",
        "Gross Salary",
        "Tax (10%)",
        "Net Payable"
      ]
    ];

    // 4. Data Rows
    const body = employees.map((emp) => [
      emp.id,
      emp.name,
      emp.role,
      `${emp.hours_logged}h`,
      `$${emp.hourly_rate.toFixed(2)}`,
      `$${(emp.regular_pay ?? (emp.regular_hours * emp.hourly_rate)).toFixed(2)}`,
      emp.overtime_hours > 0 ? `+${emp.overtime_hours}h` : "0h",
      `$${(emp.overtime_pay ?? 0).toFixed(2)}`,
      `$${emp.gross_salary.toFixed(2)}`,
      `-$${emp.tax_deduction.toFixed(2)}`,
      `$${emp.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    ]);

    // 5. Totals Row
    if (kpis) {
      body.push([
        "TOTALS",
        `${kpis.total_employees} Employees`,
        "All Roles",
        `${kpis.total_hours}h`,
        "-",
        "-",
        `+${kpis.total_overtime_hours}h`,
        "-",
        "-",
        "-",
        `$${kpis.total_payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ]);
    }

    // 6. Draw Table
    autoTable(doc, {
      startY: 125,
      head: headers,
      body: body,
      theme: "striped",
      headStyles: {
        fillColor: [30, 41, 59], // Slate-800
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold"
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 6,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        10: { fontStyle: "bold", textColor: [16, 149, 102] } // Emerald green for Net Payable
      }
    });

    // 7. Save and trigger automatic PDF download
    doc.save("NuGenova_Payroll_October_2026.pdf");
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans p-6 md:p-10 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between pb-8 border-b gap-4 ${
        isDarkMode ? "border-slate-800" : "border-slate-200"
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded">
              VARUN SHARMA | CEO
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium ${
              isDarkMode ? "text-emerald-400" : "text-emerald-600"
            }`}>
              <ShieldCheck className="w-4 h-4" /> Confidential & Encrypted
            </span>
          </div>
          <h1 className={`text-3xl font-extrabold mt-2 tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}>
            NuGenova Payroll Intelligence
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Automated timesheet calculations and executive salary disbursements.
          </p>
        </div>

        {/* Action Controls: Single Download Report Button + Sync + Theme Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SINGLE BUTTON: Download Report (PDF) */}
          <button
            onClick={downloadPDFReport}
            title="Download complete payroll report as PDF"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition shadow-sm ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-500"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Light/Dark Theme"
            className={`p-2 rounded-lg border transition ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sync Button */}
          <button 
            onClick={loadData}
            title="Sync latest timesheets"
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
            Sync
          </button>

          <span className={`font-semibold px-3.5 py-2 rounded-lg text-xs border shadow-sm ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-blue-400"
              : "bg-white border-slate-200 text-blue-600"
          }`}>
            October 2026
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
        {/* Total Payout */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            <span>Total Net Payout</span>
            <DollarSign className={`w-5 h-5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>
          <div className={`text-3xl font-bold mt-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            ${kpis ? kpis.total_payout.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "..."}
          </div>
          <div className={`text-xs mt-2 flex items-center gap-1 ${
            isDarkMode ? "text-emerald-400" : "text-emerald-600 font-medium"
          }`}>
            <TrendingUp className="w-3.5 h-3.5" /> Approved timesheets only
          </div>
        </div>

        {/* Total Hours */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            <span>Total Hours Logged</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className={`text-3xl font-bold mt-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {kpis ? `${kpis.total_hours} hrs` : "..."}
          </div>
          <div className={`text-xs mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Average {kpis && kpis.total_employees ? (kpis.total_hours / kpis.total_employees).toFixed(1) : 0} hrs/person
          </div>
        </div>

        {/* Total Overtime */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            <span>Overtime Logged</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className={`text-3xl font-bold mt-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {kpis ? `${kpis.total_overtime_hours} hrs` : "..."}
          </div>
          <div className={`text-xs mt-2 ${isDarkMode ? "text-amber-400/90" : "text-amber-600 font-medium"}`}>
            Paid at 1.5x regular wage
          </div>
        </div>

        {/* Active Employees */}
        <div className={`p-6 rounded-2xl border shadow-sm transition ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            <span>Active Team Members</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div className={`text-3xl font-bold mt-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {kpis ? kpis.total_employees : "..."}
          </div>
          <div className={`text-xs mt-2 ${isDarkMode ? "text-purple-400" : "text-purple-600 font-medium"}`}>
            All timesheets submitted
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Clean Table (No Badges), Right = AI Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Full Company Payroll Table (7 Cols) */}
        <div className={`lg:col-span-7 rounded-2xl p-6 border shadow-sm flex flex-col transition ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Company Payroll Breakdown
              </h2>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Employee working hours and calculated net salary.
              </p>
            </div>
            {/* Search Input with Instant Response */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className={`rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 border transition ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase tracking-wider ${
                isDarkMode ? "bg-slate-800/60 text-slate-400" : "bg-slate-100 text-slate-600"
              }`}>
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Employee</th>
                  <th className="py-3 px-3">Hours</th>
                  <th className="py-3 px-3">Overtime</th>
                  <th className="py-3 px-3">Tax (10%)</th>
                  <th className="py-3 px-4 rounded-r-lg">Net Payable</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-700"}`}>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={`transition ${isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                    {/* Clean Name & Role (Badges Removed!) */}
                    <td className="py-3.5 px-4">
                      <div className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {emp.name}
                      </div>
                      <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {emp.role}
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium">{emp.hours_logged}h</span>
                    </td>

                    {/* Overtime */}
                    <td className="py-3.5 px-3">
                      {emp.overtime_hours > 0 ? (
                        <span className="text-amber-500 font-semibold">+{emp.overtime_hours}h</span>
                      ) : (
                        <span className="text-slate-400">0h</span>
                      )}
                    </td>

                    {/* Tax Deduction */}
                    <td className="py-3.5 px-3 text-red-500">
                      -${emp.tax_deduction.toFixed(2)}
                    </td>

                    {/* Net Payable */}
                    <td className={`py-3.5 px-4 font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                      ${emp.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI Chatbot Component */}
        <div className="lg:col-span-5">
          <ChatWidget isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// CLEAN MESSAGE FORMATTER
// Removes raw asterisks (*, **) and renders real bold text and clean bullets
// =====================================================================
function renderCleanMessage(text: string, isDarkMode: boolean) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-2" />;

        // Check if line is a bullet item (starts with *, -, or •)
        const isBullet = /^[*\-•]\s+/.test(trimmed);
        if (isBullet) {
          trimmed = trimmed.replace(/^[*\-•]\s+/, "");
        }

        // Clean up markdown headers like "### Heading" -> clean bold title
        const isHeader = /^#{1,4}\s+/.test(trimmed);
        if (isHeader) {
          trimmed = trimmed.replace(/^#{1,4}\s+/, "");
        }

        // Parse **bold** parts
        const parts = trimmed.split(/(\*\*.*?\*\*|\*.*?\*)/g);

        return (
          <div key={lineIdx} className={`flex items-start gap-2 ${isBullet ? "pl-2" : ""}`}>
            {isBullet && (
              <span className="text-blue-500 font-bold select-none text-base leading-none mt-0.5">
                •
              </span>
            )}
            <span className={`flex-1 leading-relaxed ${isHeader ? "font-bold text-sm tracking-wide" : ""}`}>
              {parts.map((part, partIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  const boldText = part.slice(2, -2);
                  return (
                    <strong
                      key={partIdx}
                      className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {boldText}
                    </strong>
                  );
                }
                if (part.startsWith("*") && part.endsWith("*")) {
                  const italicText = part.slice(1, -1);
                  return (
                    <span key={partIdx} className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                      {italicText}
                    </span>
                  );
                }
                // Strip any remaining lone asterisks
                const cleanPart = part.replace(/\*/g, "");
                return <span key={partIdx}>{cleanPart}</span>;
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  sender: "bot",
  text: "👋 Welcome, Varun Sharma! Ask me anything about employee timesheets, overtime, or salaries. For example: 'Why is Satnam's salary higher than Abhishek?'"
};

function ChatWidget({ isDarkMode }: { isDarkMode: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // References for aborting requests and remembering the last sent prompt
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string>("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 1. Load saved messages from localStorage on mount & auto-migrate any old "CEO" references
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nugenova_ceo_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((m: ChatMessage) => ({
            ...m,
            text: m.text.replace(/Welcome, (CEO|Varun)!?/gi, "Welcome, Varun Sharma!")
          }));
          setMessages(migrated);
        }
      }
    } catch (e) {
      console.warn("Could not load chat history from localStorage", e);
    }
  }, []);

  // 2. Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem("nugenova_ceo_chat_history", JSON.stringify(messages));
      }
    } catch (e) {
      console.warn("Could not save chat history to localStorage", e);
    }
  }, [messages]);

  // 3. Auto-scroll down whenever a new message is added or AI starts thinking
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  // Clear Chat History
  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    try {
      localStorage.removeItem("nugenova_ceo_chat_history");
    } catch {}
  };

  // STOP Generation Handler
  const handleStopGeneration = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel network request immediately
      abortControllerRef.current = null;
    }
    setLoadingChat(false);

    // Restore prompt back into the input bar
    setInputMessage(lastPromptRef.current);

    // Cleanly remove the pending user question from chat
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].sender === "user") {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  // SEND Message Handler
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || loadingChat) return;

    // Remember prompt in case user cancels
    lastPromptRef.current = textToSend;
    setInputMessage("");

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setLoadingChat(true);

    // Create an AbortController so the user can cancel anytime
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
        signal: controller.signal // Connect the abort signal!
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ Unable to connect to backend server (${API_BASE}). Make sure your Python backend is running.` }
      ]);
    } finally {
      setLoadingChat(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className={`rounded-2xl border flex flex-col h-[600px] shadow-sm transition ${
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
    }`}>
      {/* Chat Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDarkMode ? "border-slate-800" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              AI Assistant for Varun Sharma
            </h3>
            <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Gemini 3.5 Flash Online
            </p>
          </div>
        </div>
        
        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          title="Clear Chat History"
          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition border ${
            isDarkMode 
              ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border-slate-200"
          }`}
        >
          <Trash2 className="w-3 h-3 text-red-400" />
          Clear
        </button>
      </div>

      {/* Quick Prompt Pills */}
      <div className={`px-4 py-2 border-b flex gap-2 overflow-x-auto text-xs ${
        isDarkMode ? "border-slate-800" : "border-slate-200"
      }`}>
        <button
          onClick={() => handleSendMessage("Why is Satnam's salary higher than Abhishek?")}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition border ${
            isDarkMode 
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
          }`}
        >
          Satnam vs Abhishek
        </button>
        <button
          onClick={() => handleSendMessage("Did anyone log low hours this month?")}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition border ${
            isDarkMode 
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
          }`}
        >
          Low Hours Check
        </button>
        <button
          onClick={() => handleSendMessage("Who worked the most overtime and what did it cost us?")}
          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition border ${
            isDarkMode 
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
          }`}
        >
          Overtime Cost
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                  : isDarkMode
                  ? "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none font-sans"
                  : "bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none font-sans"
              }`}
            >
              {renderCleanMessage(msg.text, isDarkMode)}
            </div>
            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center shrink-0 text-slate-200">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loadingChat && (
          <div className={`flex gap-3 items-center text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <Bot className="w-4 h-4 animate-spin text-blue-500" />
            Gemini is analyzing timesheets and executing calculations...
          </div>
        )}
        <div ref={chatScrollRef} />
      </div>

      {/* Input Bar with Compact Square Icon Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loadingChat) {
            handleSendMessage();
          }
        }}
        className={`p-3 border-t flex items-center gap-2 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask: 'Why is Satnam's pay higher?'..."
          className={`flex-1 rounded-xl px-4 py-2 text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            isDarkMode
              ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500"
              : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
          }`}
        />

        {/* Minimalist Square Stop Button (Icon-Only, No Text) */}
        {loadingChat ? (
          <button
            type="button"
            onClick={handleStopGeneration}
            title="Stop generating"
            className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition border shadow-sm ${
              isDarkMode 
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            title="Send question"
            className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
    </div>
  );
}
