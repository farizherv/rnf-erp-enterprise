(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/features/gl/components/reports/EnterpriseReportViewer.tsx
  var import_react8 = __toESM(__require("react"), 1);
  var html2pdfLib = __toESM(__require("html2pdf.js"), 1);
  var import_lucide_react7 = __require("lucide-react");

  // src/features/gl/components/reports/AdvancedSelectionModal.tsx
  var import_react2 = __toESM(__require("react"), 1);
  var import_lucide_react = __require("lucide-react");

  // src/features/gl/hooks/useReportParameters.ts
  var import_react = __require("react");
  var useReportParameters = () => {
    const [params, setParams] = (0, import_react.useState)({
      branches: ["ALL"],
      datePreset: "THIS_MONTH",
      periodFrom: "",
      periodTo: "",
      comparePeriodFrom: "",
      comparePeriodTo: "",
      compareTo: "NONE",
      ledger: "0L",
      scenario: "ACT",
      costCenters: ["ALL"],
      businessArea: "ALL",
      currency: "IDR",
      includeUnposted: false,
      hideZeroBalance: true
    });
    const defaultProfiles = [
      {
        id: "prof-1",
        name: "Default Audit View (All Branches)",
        params: {
          branches: ["ALL"],
          datePreset: "THIS_YEAR",
          periodFrom: "2026-01-01",
          periodTo: "2026-12-31",
          compareTo: "PREV_YEAR",
          ledger: "0L",
          scenario: "ACT",
          costCenters: ["ALL"],
          businessArea: "ALL",
          currency: "IDR",
          includeUnposted: false,
          hideZeroBalance: true
        }
      }
    ];
    const [savedProfiles, setSavedProfiles] = (0, import_react.useState)(() => {
      const saved = localStorage.getItem("erp_saved_variants");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return defaultProfiles;
        }
      }
      return defaultProfiles;
    });
    (0, import_react.useEffect)(() => {
      localStorage.setItem("erp_saved_variants", JSON.stringify(savedProfiles));
    }, [savedProfiles]);
    (0, import_react.useEffect)(() => {
      if (params.datePreset === "CUSTOM") return;
      const today = /* @__PURE__ */ new Date("2026-06-17");
      let from = new Date(today);
      let to = new Date(today);
      switch (params.datePreset) {
        case "TODAY":
          break;
        case "THIS_WEEK":
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          from = new Date(today.setDate(diff));
          to = new Date(from);
          to.setDate(to.getDate() + 6);
          break;
        case "THIS_MONTH":
          from = new Date(today.getFullYear(), today.getMonth(), 1);
          to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case "LAST_MONTH":
          from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          to = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "THIS_QUARTER":
          const q = Math.floor(today.getMonth() / 3);
          from = new Date(today.getFullYear(), q * 3, 1);
          to = new Date(today.getFullYear(), q * 3 + 3, 0);
          break;
        case "LAST_QUARTER":
          const lq = Math.floor(today.getMonth() / 3) - 1;
          from = new Date(today.getFullYear(), lq * 3, 1);
          to = new Date(today.getFullYear(), lq * 3 + 3, 0);
          break;
        case "YTD":
        case "THIS_YEAR":
          from = new Date(today.getFullYear(), 0, 1);
          to = new Date(today.getFullYear(), 11, 31);
          if (params.datePreset === "YTD") to = /* @__PURE__ */ new Date("2026-06-17");
          break;
      }
      const formatDate = (d) => d.toISOString().split("T")[0];
      setParams((prev) => ({
        ...prev,
        periodFrom: formatDate(from),
        periodTo: formatDate(to)
      }));
    }, [params.datePreset]);
    const loadProfile = (profileId) => {
      const profile = savedProfiles.find((p) => p.id === profileId);
      if (profile) {
        setParams(profile.params);
      }
    };
    const saveCurrentAsProfile = (name) => {
      const newProfile = {
        id: `prof-${Date.now()}`,
        name,
        params: { ...params }
      };
      setSavedProfiles([...savedProfiles, newProfile]);
    };
    return {
      params,
      setParams,
      savedProfiles,
      loadProfile,
      saveCurrentAsProfile
    };
  };

  // src/features/gl/components/reports/AdvancedSelectionModal.tsx
  var AdvancedSelectionModal = ({ report, onClose, onExecute }) => {
    const { params, setParams, savedProfiles, loadProfile, saveCurrentAsProfile } = useReportParameters();
    const [showSaveDialog, setShowSaveDialog] = (0, import_react2.useState)(false);
    const [newProfileName, setNewProfileName] = (0, import_react2.useState)("");
    if (!report) return null;
    const isYearOnly = report.behavior?.requiresYearOnly === true;
    const isAsOfOnly = isYearOnly || report.behavior?.requiresDateRange === false || report.group === "bs" && report.behavior?.requiresDateRange !== true;
    const isGraph = report.group === "graph";
    const handleSaveVariant = () => {
      if (newProfileName.trim()) {
        saveCurrentAsProfile(newProfileName.trim());
        setShowSaveDialog(false);
        setNewProfileName("");
      }
    };
    return /* @__PURE__ */ import_react2.default.createElement("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "bg-[#EEF2F6] px-8 py-5 flex justify-between items-center shrink-0 border-b border-slate-200 relative" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "text-xl font-bold text-slate-800 flex items-center gap-2" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.SlidersHorizontal, { className: "w-5 h-5 text-slate-600" }), " Advanced Selection Screen"), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-slate-600 text-sm mt-1 truncate max-w-lg" }, report.name)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-4" }, savedProfiles && savedProfiles.length > 0 && /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        className: "text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm max-w-[200px] truncate",
        onChange: (e) => loadProfile(e.target.value),
        defaultValue: ""
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "", disabled: true }, "Load Variant..."),
      savedProfiles.map((p) => /* @__PURE__ */ import_react2.default.createElement("option", { key: p.id, value: p.id }, p.name))
    ), /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: () => setShowSaveDialog(!showSaveDialog),
        className: "flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-700 bg-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/50"
      },
      /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Bookmark, { className: "w-4 h-4" }),
      " Save Variant"
    ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-px h-6 bg-slate-300" }), /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: onClose,
        className: "p-1.5 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none"
      },
      /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.X, { className: "w-5 h-5" })
    )), showSaveDialog && /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute top-full right-8 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in slide-in-from-top-2" }, /* @__PURE__ */ import_react2.default.createElement("h4", { className: "text-sm font-bold text-slate-800 mb-2" }, "Save Selection Variant"), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-xs text-slate-500 mb-3" }, "Save these filters to use them later."), /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "text",
        placeholder: "Variant Name (e.g. Q3 IFRS Report)",
        value: newProfileName,
        onChange: (e) => setNewProfileName(e.target.value),
        className: "w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3",
        autoFocus: true
      }
    ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex justify-end gap-2" }, /* @__PURE__ */ import_react2.default.createElement("button", { onClick: () => setShowSaveDialog(false), className: "px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md" }, "Cancel"), /* @__PURE__ */ import_react2.default.createElement("button", { onClick: handleSaveVariant, disabled: !newProfileName.trim(), className: "px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50" }, "Save")))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 relative" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "grid grid-cols-2 gap-8" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Book, { className: "w-4 h-4" }), " Accounting Principle (Ledger)"), /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        value: params.ledger,
        onChange: (e) => setParams({ ...params, ledger: e.target.value }),
        className: "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "0L" }, "0L - Leading Ledger (Local GAAP)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "2L" }, "2L - Non-Leading Ledger (IFRS)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "3L" }, "3L - Tax Ledger")
    )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.LineChart, { className: "w-4 h-4" }), " Reporting Scenario"), /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        value: params.scenario,
        onChange: (e) => setParams({ ...params, scenario: e.target.value }),
        className: "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "ACT" }, "Actuals (Posted Transactions)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "BUD" }, "Budget (Financial Plan)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "FOR" }, "Forecast (Projected)")
    ))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Building, { className: "w-4 h-4" }), " Consolidation Scope (Branch)"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-full border border-slate-300 rounded-xl p-3 bg-slate-50 h-full max-h-[160px] overflow-y-auto custom-scrollbar space-y-1" }, [
      { id: "ALL", label: "[ALL] Corporate Parent", isBold: true },
      { id: "JKT", label: "1000 - Cabang Jakarta (HQ)" },
      { id: "SBY", label: "2000 - Cabang Surabaya" },
      { id: "BDG", label: "3000 - Cabang Bandung" }
    ].map((branch) => /* @__PURE__ */ import_react2.default.createElement("label", { key: branch.id, className: "flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:shadow-sm" }, /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "checkbox",
        className: "w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500",
        checked: params.branches?.includes(branch.id) || branch.id === "ALL" && (!params.branches || params.branches.length === 0),
        onChange: (e) => {
          let newArr = params.branches || [];
          if (e.target.checked) {
            if (branch.id === "ALL") newArr = ["ALL"];
            else newArr = [...newArr.filter((id) => id !== "ALL"), branch.id];
          } else {
            newArr = newArr.filter((id) => id !== branch.id);
          }
          setParams({ ...params, branches: newArr });
        }
      }
    ), /* @__PURE__ */ import_react2.default.createElement("span", { className: `text-sm ${branch.isBold ? "font-bold text-blue-700" : "font-medium text-slate-700"}` }, branch.label)))))), /* @__PURE__ */ import_react2.default.createElement("hr", { className: "border-slate-200" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "grid grid-cols-2 gap-8" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Tags, { className: "w-4 h-4" }), " Cost Center (Multi-Select)"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-full border border-slate-300 rounded-xl p-3 bg-slate-50 max-h-36 overflow-y-auto custom-scrollbar space-y-1" }, [
      { id: "ALL", label: "[ALL] Entity Wide", isBold: true },
      { id: "CC01", label: "CC01 - Marketing Dept" },
      { id: "CC02", label: "CC02 - IT & Dev Dept" },
      { id: "PRJ_A", label: "PRJ-A - Government Tender" }
    ].map((cc) => /* @__PURE__ */ import_react2.default.createElement("label", { key: cc.id, className: "flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200" }, /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "checkbox",
        className: "w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500",
        checked: params.costCenters?.includes(cc.id) || cc.id === "ALL" && (!params.costCenters || params.costCenters.length === 0),
        onChange: (e) => {
          let newArr = params.costCenters || [];
          if (e.target.checked) {
            if (cc.id === "ALL") newArr = ["ALL"];
            else newArr = [...newArr.filter((id) => id !== "ALL"), cc.id];
          } else {
            newArr = newArr.filter((id) => id !== cc.id);
          }
          setParams({ ...params, costCenters: newArr });
        }
      }
    ), /* @__PURE__ */ import_react2.default.createElement("span", { className: `text-sm ${cc.isBold ? "font-bold text-slate-800" : "font-medium text-slate-700"}` }, cc.label))))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Briefcase, { className: "w-4 h-4" }), " Business Area / Segment"), /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        value: params.businessArea || "ALL",
        onChange: (e) => setParams({ ...params, businessArea: e.target.value }),
        className: "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "ALL" }, "[ALL] Entity Wide"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "BA01" }, "BA01 - Retail Operations"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "BA02" }, "BA02 - Manufacturing & Factory"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "BA03" }, "BA03 - Services & Consulting")
    ))), /* @__PURE__ */ import_react2.default.createElement("hr", { className: "border-slate-200" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "grid grid-cols-2 gap-8" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, isYearOnly ? null : /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Calendar, { className: "w-4 h-4" }), isYearOnly ? isGraph ? "Evaluation Year (Tahun)" : "As Of Year (Per Tahun)" : isAsOfOnly ? "As Of Date (Per Tanggal)" : report.behavior?.defaultComparison === "PREV_PERIOD" ? "Primary Period" : isGraph ? "Evaluation Period (Time Frame)" : "Reporting Period (Statutory)"), !isYearOnly && /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        className: "text-xs font-bold text-blue-600 bg-transparent border-none outline-none cursor-pointer hover:underline",
        value: params.datePreset,
        onChange: (e) => setParams({ ...params, datePreset: e.target.value })
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "CUSTOM" }, "Custom Range..."),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "FISCAL_PERIOD" }, "Fiscal Period (Accounting)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "TODAY" }, "Today"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "THIS_WEEK" }, "This Week"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "THIS_MONTH" }, "This Month"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "LAST_MONTH" }, "Last Month"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "THIS_QUARTER" }, "This Quarter"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "YTD" }, "Year to Date (YTD)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "THIS_YEAR" }, "This Year")
    )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200" }, isYearOnly ? /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "number",
        value: params.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear(),
        onChange: (e) => setParams({ ...params, periodTo: `${e.target.value}-12-31`, datePreset: "CUSTOM" }),
        className: "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400",
        min: "1900",
        max: "2100"
      }
    ) : params.datePreset === "FISCAL_PERIOD" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "number",
        placeholder: "Year",
        value: new Date(params.periodFrom || /* @__PURE__ */ new Date()).getFullYear(),
        onChange: (e) => setParams({ ...params, periodFrom: `${e.target.value}-01-01`, periodTo: `${e.target.value}-12-31` }),
        className: "w-1/3 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400 text-center"
      }
    ), /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        className: "w-2/3 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400",
        onChange: (e) => {
          const year = new Date(params.periodFrom || /* @__PURE__ */ new Date()).getFullYear();
          const month = e.target.value;
          const lastDay = new Date(year, parseInt(month), 0).getDate();
          setParams({ ...params, periodFrom: `${year}-${month.padStart(2, "0")}-01`, periodTo: `${year}-${month.padStart(2, "0")}-${lastDay}` });
        },
        value: String(new Date(params.periodTo || /* @__PURE__ */ new Date()).getMonth() + 1)
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "1" }, "Period 01 (Jan)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "2" }, "Period 02 (Feb)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "3" }, "Period 03 (Mar)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "4" }, "Period 04 (Apr)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "5" }, "Period 05 (May)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "6" }, "Period 06 (Jun)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "7" }, "Period 07 (Jul)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "8" }, "Period 08 (Aug)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "9" }, "Period 09 (Sep)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "10" }, "Period 10 (Oct)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "11" }, "Period 11 (Nov)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "12" }, "Period 12 (Dec)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "13" }, "Period 13 (Adjustment/Audit)")
    )) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, !isAsOfOnly && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "date",
        value: params.periodFrom,
        onChange: (e) => setParams({ ...params, periodFrom: e.target.value, datePreset: "CUSTOM" }),
        className: "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
      }
    ), /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-slate-400 font-bold px-1" }, "to")), /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "date",
        value: params.periodTo,
        onChange: (e) => setParams({ ...params, periodTo: e.target.value, datePreset: "CUSTOM" }),
        className: "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
      }
    ))), report.behavior?.defaultComparison === "PREV_PERIOD" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "pt-2 space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Clock, { className: "w-4 h-4" }), " Compare To Period"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200" }, /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "date",
        value: params.comparePeriodFrom || "",
        onChange: (e) => setParams({ ...params, comparePeriodFrom: e.target.value }),
        className: "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
      }
    ), /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-slate-400 font-bold px-1" }, "to"), /* @__PURE__ */ import_react2.default.createElement(
      "input",
      {
        type: "date",
        value: params.comparePeriodTo || "",
        onChange: (e) => setParams({ ...params, comparePeriodTo: e.target.value }),
        className: "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all hover:border-slate-400"
      }
    )))), !isGraph && /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Clock, { className: "w-4 h-4" }), " Variance Analysis"), /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        value: params.compareTo,
        onChange: (e) => setParams({ ...params, compareTo: e.target.value }),
        className: "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "NONE" }, "No Comparison"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "PREV_PERIOD" }, "Compare to Previous Period"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "PREV_YEAR" }, "Compare to Previous Year (YoY)"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "BUDGET" }, "Compare to Budget")
    ))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "grid grid-cols-2 gap-8" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.DollarSign, { className: "w-4 h-4" }), " Display Currency"), /* @__PURE__ */ import_react2.default.createElement(
      "select",
      {
        value: params.currency,
        onChange: (e) => setParams({ ...params, currency: e.target.value }),
        className: "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors shadow-sm"
      },
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "IDR" }, "IDR - Base Currency"),
      /* @__PURE__ */ import_react2.default.createElement("option", { value: "USD" }, "USD - Reporting Currency (Rate: Live)")
    )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider" }, /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.FileText, { className: "w-4 h-4" }), " Data Inclusion Settings"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200" }, /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        className: "flex items-center justify-between cursor-pointer group",
        onClick: () => setParams({ ...params, includeUnposted: !params.includeUnposted })
      },
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors" }, "Include Unposted / Draft"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[11px] text-slate-500" }, "Calculate totals including draft journals.")),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: `w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${params.includeUnposted ? "bg-blue-600" : "bg-slate-300"}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: `bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${params.includeUnposted ? "translate-x-5" : "translate-x-0"}` }))
    ), /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        className: "flex items-center justify-between cursor-pointer group",
        onClick: () => setParams({ ...params, hideZeroBalance: !params.hideZeroBalance })
      },
      /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors" }, "Hide Zero-Balance Accounts"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[11px] text-slate-500" }, "Do not display accounts with 0 balance.")),
      /* @__PURE__ */ import_react2.default.createElement("div", { className: `w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${params.hideZeroBalance ? "bg-blue-600" : "bg-slate-300"}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: `bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${params.hideZeroBalance ? "translate-x-5" : "translate-x-0"}` }))
    ))))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-end shrink-0" }, /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: () => {
          onExecute(params, "HTML_GRID");
          onClose();
        },
        className: "px-10 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95"
      },
      /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.PlayCircle, { className: "w-5 h-5" }),
      " Execute Report"
    ))));
  };

  // src/features/gl/components/reports/MemorizeReportModal.tsx
  var import_react3 = __toESM(__require("react"), 1);
  var import_react_dom = __require("react-dom");
  var import_lucide_react2 = __require("lucide-react");
  var MemorizeReportModal = ({ currentReportName, onClose, onSave }) => {
    const [reportName, setReportName] = (0, import_react3.useState)(currentReportName);
    const [reportTitle, setReportTitle] = (0, import_react3.useState)(currentReportName);
    const [selectedRowIndex, setSelectedRowIndex] = (0, import_react3.useState)(0);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = (0, import_react3.useState)(false);
    const formatDateTimeAMPM = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      return `${day}/${month}/${year} ${timeStr}`;
    };
    const [existingReports, setExistingReports] = (0, import_react3.useState)([]);
    import_react3.default.useEffect(() => {
      const saved = localStorage.getItem("rnf_report_presets");
      if (saved) {
        try {
          setExistingReports(JSON.parse(saved));
        } catch (e) {
        }
      }
    }, []);
    const handleSaveAttempt = () => {
      const exists = existingReports.some((r) => r.name.toLowerCase() === reportName.toLowerCase());
      if (exists) {
        setShowOverwriteConfirm(true);
      } else {
        executeSave();
      }
    };
    const executeSave = () => {
      const newPreset = {
        id: Date.now().toString(),
        name: reportName,
        title: reportTitle,
        lastModified: formatDateTimeAMPM(/* @__PURE__ */ new Date())
        // config will be attached by parent
      };
      let updated = [...existingReports];
      const existingIndex = updated.findIndex((r) => r.name.toLowerCase() === reportName.toLowerCase());
      if (existingIndex >= 0) {
        newPreset.id = updated[existingIndex].id;
        updated[existingIndex] = newPreset;
      } else {
        updated.push(newPreset);
      }
      onSave(reportName, reportTitle);
    };
    const modalContent = /* @__PURE__ */ import_react3.default.createElement("div", { className: "fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "relative bg-white border border-slate-200 rounded-xl shadow-2xl w-[750px] flex flex-col overflow-hidden font-sans transform transition-all" }, showOverwriteConfirm && /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute inset-0 z-[50] flex items-center justify-center bg-transparent animate-in fade-in duration-150" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-white border border-slate-200 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-[420px] p-6 text-center flex flex-col items-center animate-in zoom-in-95 duration-200" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.AlertTriangle, { className: "w-6 h-6 text-amber-500", strokeWidth: 2.5 })), /* @__PURE__ */ import_react3.default.createElement("h3", { className: "text-[16px] font-bold text-slate-800 mb-2 tracking-tight" }, "Format Sudah Ada"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-[13px] text-slate-600 mb-6 leading-relaxed" }, "Format laporan dengan nama ", /* @__PURE__ */ import_react3.default.createElement("span", { className: "font-bold text-slate-800" }, '"', reportName, '"'), " sudah ada di database. Apakah Anda yakin ingin menimpanya?"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex gap-3 w-full" }, /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        onClick: () => setShowOverwriteConfirm(false),
        className: "flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition-colors text-[13px]"
      },
      "Batal"
    ), /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        onClick: () => {
          setShowOverwriteConfirm(false);
          onSave(reportName, reportTitle);
        },
        className: "flex-1 px-4 py-2 bg-amber-500 text-white font-bold rounded-md hover:bg-amber-600 transition-colors shadow-sm text-[13px]"
      },
      "Ya, Timpa Format"
    )))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-white px-5 py-3.5 flex justify-between items-center select-none border-b border-slate-100" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center gap-2.5 text-slate-800" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-blue-50 p-1.5 rounded-md" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Bookmark, { className: "w-4 h-4 text-blue-600" })), /* @__PURE__ */ import_react3.default.createElement("h2", { className: "text-[15px] font-bold tracking-tight" }, "Simpan Format Laporan")), /* @__PURE__ */ import_react3.default.createElement("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.X, { className: "w-4 h-4", strokeWidth: 2.5 }))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "p-5 flex flex-col gap-5 bg-slate-50/50" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-white border border-slate-200 rounded-lg shadow-sm h-[200px] flex flex-col select-none overflow-hidden" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "grid grid-cols-12 bg-slate-50 border-b border-slate-200 sticky top-0 z-10" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "col-span-5 px-4 py-2.5 text-[12px] font-bold text-slate-600 border-r border-slate-200 flex items-center" }, "Nama Format"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "col-span-4 px-4 py-2.5 text-[12px] font-bold text-slate-600 border-r border-slate-200 flex items-center" }, "Judul Laporan"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "col-span-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 flex items-center justify-center text-center" }, "Terakhir Diubah")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "overflow-y-auto flex-1 flex flex-col custom-scrollbar" }, existingReports.map((row, idx) => /* @__PURE__ */ import_react3.default.createElement(
      "div",
      {
        key: idx,
        onClick: () => setSelectedRowIndex(idx),
        className: `grid grid-cols-12 cursor-pointer text-[13px] border-b border-slate-100 last:border-b-0 shrink-0 transition-colors
                    ${selectedRowIndex === idx ? "bg-blue-50/80 text-blue-800" : "hover:bg-slate-50 text-slate-700"}`
      },
      /* @__PURE__ */ import_react3.default.createElement("div", { className: `col-span-5 px-4 py-2.5 border-r border-slate-100 flex items-start font-medium leading-snug break-words pr-2` }, row.name),
      /* @__PURE__ */ import_react3.default.createElement("div", { className: `col-span-4 px-4 py-2.5 border-r border-slate-100 flex items-start leading-snug break-words pr-2` }, row.title),
      /* @__PURE__ */ import_react3.default.createElement("div", { className: "col-span-3 px-4 py-2.5 text-center flex items-start justify-center text-slate-500 text-[11.5px] pt-3" }, row.lastModified)
    )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 bg-transparent cursor-default", onClick: () => setSelectedRowIndex(null) }))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "grid grid-cols-12 gap-5" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "col-span-9 flex flex-col gap-3.5" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ import_react3.default.createElement("label", { className: "text-[12px] font-bold text-slate-600 flex justify-between items-end" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "Nama Format"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-[10px] font-normal text-slate-400 font-mono" }, reportName.length, "/100")), /* @__PURE__ */ import_react3.default.createElement(
      "input",
      {
        type: "text",
        maxLength: 100,
        value: reportName,
        onChange: (e) => setReportName(e.target.value),
        className: "w-full px-3 py-2 text-[13px] font-medium text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow shadow-sm",
        placeholder: "Contoh: Balance Sheet (Direksi)"
      }
    )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ import_react3.default.createElement("label", { className: "text-[12px] font-bold text-slate-600 flex justify-between items-end" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "Judul Laporan"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-[10px] font-normal text-slate-400 font-mono" }, reportTitle.length, "/150")), /* @__PURE__ */ import_react3.default.createElement(
      "input",
      {
        type: "text",
        maxLength: 150,
        value: reportTitle,
        onChange: (e) => setReportTitle(e.target.value),
        className: "w-full px-3 py-2 text-[13px] font-medium text-slate-800 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-shadow shadow-sm",
        placeholder: "Judul yang dicetak di kertas"
      }
    ))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "col-span-3 flex flex-col justify-end gap-2.5" }, /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        onClick: handleSaveAttempt,
        className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[13px] font-bold transition-colors shadow-sm"
      },
      /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Save, { className: "w-4 h-4" }),
      "Simpan"
    ), /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        onClick: onClose,
        className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md text-[13px] font-bold transition-colors shadow-sm"
      },
      "Batal"
    ))))));
    return (0, import_react_dom.createPortal)(modalContent, document.body);
  };

  // src/features/gl/components/reports/LoadPresetModal.tsx
  var import_react4 = __toESM(__require("react"), 1);
  var import_react_dom2 = __require("react-dom");
  var import_lucide_react3 = __require("lucide-react");
  var LoadPresetModal = ({ onClose, onLoad }) => {
    const [presets, setPresets] = (0, import_react4.useState)([]);
    (0, import_react4.useEffect)(() => {
      const saved = localStorage.getItem("rnf_report_presets");
      if (saved) {
        try {
          setPresets(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse presets", e);
        }
      }
    }, []);
    const handleDelete = (e, id) => {
      e.stopPropagation();
      const newPresets = presets.filter((p) => p.id !== id);
      setPresets(newPresets);
      localStorage.setItem("rnf_report_presets", JSON.stringify(newPresets));
    };
    const modalContent = /* @__PURE__ */ import_react4.default.createElement("div", { className: "fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "relative bg-white border border-slate-200 rounded-xl shadow-2xl w-[600px] flex flex-col overflow-hidden font-sans transform transition-all animate-in zoom-in-95 duration-200" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "bg-white px-5 py-3.5 flex justify-between items-center select-none border-b border-slate-100" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-2.5 text-slate-800" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "bg-blue-50 p-1.5 rounded-md" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Bookmark, { className: "w-4 h-4 text-blue-600" })), /* @__PURE__ */ import_react4.default.createElement("h2", { className: "text-[15px] font-bold tracking-tight" }, "Muat Format Laporan")), /* @__PURE__ */ import_react4.default.createElement("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.X, { className: "w-4 h-4", strokeWidth: 2.5 }))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "p-5 flex flex-col gap-4 bg-slate-50/50 min-h-[300px] max-h-[500px] overflow-y-auto" }, presets.length === 0 ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex-1 flex flex-col items-center justify-center text-center opacity-70" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Bookmark, { className: "w-12 h-12 text-slate-300 mb-3" }), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-[14px] font-bold text-slate-500" }, "Belum ada Format tersimpan"), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-[12px] text-slate-400 max-w-[250px] mt-1" }, 'Silakan gunakan fitur "Simpan Format" terlebih dahulu untuk menyimpan konfigurasi laporan.')) : /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col gap-2" }, presets.map((preset) => /* @__PURE__ */ import_react4.default.createElement(
      "div",
      {
        key: preset.id,
        onClick: () => onLoad(preset.config),
        className: "bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
      },
      /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ import_react4.default.createElement("h3", { className: "text-[14px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors" }, preset.name), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-[12px] text-slate-500 mt-0.5" }, preset.title), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-2 mt-2" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded" }, preset.config.chartType.toUpperCase()), /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded" }, preset.config.measure), /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded" }, preset.config.dimension))),
      /* @__PURE__ */ import_react4.default.createElement(
        "button",
        {
          onClick: (e) => handleDelete(e, preset.id),
          className: "p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors",
          title: "Hapus Format"
        },
        /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Trash2, { className: "w-4 h-4" })
      )
    ))))));
    return (0, import_react_dom2.createPortal)(modalContent, document.body);
  };

  // src/features/gl/components/reports/viewer/data.ts
  var BALANCE_SHEET_DATA = [
    {
      id: "assets",
      description: "ASSETS",
      isHeader: true,
      children: [
        {
          id: "current_assets",
          description: "CURRENT ASSETS",
          isHeader: true,
          children: [
            {
              id: "cash_bank",
              description: "Cash and Bank",
              isHeader: true,
              children: [
                {
                  id: "kas",
                  description: "Kas",
                  children: [
                    { id: "kas_idr", description: "Kas IDR", balance: 943e4 },
                    { id: "kas_usd", description: "Kas USD", balance: 93e5 },
                    { id: "kas_sgd", description: "Kas SGD", balance: 34e5 }
                  ],
                  balance: 2213e4
                },
                {
                  id: "bank",
                  description: "Bank",
                  children: [
                    { id: "mandiri_idr", description: "Mandiri IDR", balance: 1094782964e-1 },
                    { id: "bca_idr", description: "BCA IDR", balance: 78006656385e-2 },
                    { id: "danamon_usd", description: "Danamon USD", balance: 5766e4 },
                    { id: "panin_sgd", description: "Panin SGD", balance: 4663712 }
                  ],
                  balance: 95186857225e-2
                },
                { id: "total_cash_bank", description: "Total Cash and Bank", balance: 97399857225e-2, isTotal: true }
              ]
            },
            {
              id: "account_receivable",
              description: "Account Receivable",
              isHeader: true,
              children: [
                { id: "total_ar", description: "Total Account Receivable", balance: 0, isTotal: true }
              ]
            },
            {
              id: "inventory",
              description: "Inventory",
              isHeader: true,
              children: [
                {
                  id: "persediaan_barang",
                  description: "Persediaan Barang Dagang",
                  children: [
                    { id: "pers_bahan", description: "Persediaan Bahan Bangunan", balance: 34986683375e-2 },
                    { id: "pers_perkakas", description: "Persediaan Perkakas", balance: 18722e3 },
                    { id: "pers_elek", description: "Persediaan Elektronik", balance: 83378e3 },
                    { id: "pers_furn", description: "Persediaan Furniture", balance: 5558e4 },
                    { id: "pers_manufaktur", description: "Persediaan Dalam Proses Manufaktur", balance: -719e4 }
                  ],
                  balance: 50754683375e-2
                },
                { id: "total_inventory", description: "Total Inventory", balance: 50035683375e-2, isTotal: true }
              ]
            },
            {
              id: "other_current_assets",
              description: "Other Current Assets",
              isHeader: true,
              children: [
                {
                  id: "biaya_dimuka",
                  description: "Biaya dibayar dimuka",
                  children: [
                    { id: "sewa", description: "Sewa dibayar dimuka", balance: 36e6 },
                    { id: "asuransi", description: "Asuransi dibayar dimuka", balance: 5e7 }
                  ],
                  balance: 86e6
                },
                { id: "ppn_masukan", description: "PPN Masukan", balance: 963902188e-1 },
                { id: "proyek_proses", description: "Proyek Dalam Proses", balance: 113210965e-1 },
                { id: "total_other_current", description: "Total Other Current Assets", balance: 1937113153e-1, isTotal: true }
              ]
            },
            { id: "total_current_assets", description: "Total CURRENT ASSETS", balance: 16680667213e-1, isTotal: true }
          ]
        },
        {
          id: "fixed_assets",
          description: "FIXED ASSETS",
          isHeader: true,
          children: [
            {
              id: "historical_value",
              description: "Historical Value",
              isHeader: true,
              children: [
                {
                  id: "aktiva_tetap",
                  description: "Aktiva Tetap",
                  children: [
                    { id: "tanah", description: "Tanah", balance: 5e8 },
                    { id: "bangunan", description: "Bangunan", balance: 9e8 },
                    { id: "peralatan_ktr", description: "Peralatan Kantor", balance: 305e5 },
                    { id: "peralatan_tk", description: "Peralatan Toko", balance: 355e5 },
                    { id: "kendaraan", description: "Kendaraan", balance: 335e6 }
                  ],
                  balance: 1801e6
                },
                { id: "total_historical_value", description: "Total Historical Value", balance: 1801e6, isTotal: true }
              ]
            },
            {
              id: "accumulated_depreciation",
              description: "Accumulated Depreciation",
              isHeader: true,
              children: [
                {
                  id: "akumulasi_penyusutan",
                  description: "Akumulasi Penyusutan",
                  children: [
                    { id: "akum_bangunan", description: "Akum. Penys. Bangunan", balance: -1725e5 },
                    { id: "akum_peralatan_ktr", description: "Akum. Penys. Peralatan Kantor", balance: -229e5 },
                    { id: "akum_peralatan_tk", description: "Akum. Penys. Peralatan Toko", balance: -2625e4 },
                    { id: "akum_kendaraan", description: "Akum. Penys. Kendaraan", balance: -24365752344e-2 }
                  ],
                  balance: -46530752344e-2
                },
                { id: "total_accumulated_depreciation", description: "Total Accumulated Depreciation", balance: -46530752344e-2, isTotal: true }
              ]
            },
            { id: "total_fixed_assets", description: "Total FIXED ASSETS", balance: 133569247656e-2, isTotal: true }
          ]
        },
        {
          id: "other_assets",
          description: "OTHER ASSETS",
          isHeader: true,
          children: [
            { id: "total_other_assets", description: "Total OTHER ASSETS", balance: 0, isTotal: true }
          ]
        },
        { id: "total_assets", description: "Total ASSETS", balance: 300375919786e-2, isTotal: true }
      ]
    },
    {
      id: "liabilities_equities",
      description: "LIABILITIES and EQUITIES",
      isHeader: true,
      children: [
        {
          id: "liabilities",
          description: "LIABILITIES",
          isHeader: true,
          children: [
            {
              id: "current_liabilities",
              description: "Current Liabilities",
              isHeader: true,
              children: [
                {
                  id: "account_payables",
                  description: "Account Payables",
                  isHeader: true,
                  children: [
                    {
                      id: "hutang_usaha",
                      description: "Hutang Usaha",
                      children: [
                        { id: "hutang_usaha_idr", description: "Hutang Usaha IDR", balance: 236204540 },
                        { id: "hutang_usaha_usd", description: "Hutang Usaha USD", balance: 651e4 },
                        { id: "hutang_usaha_sgd", description: "Hutang Usaha SGD", balance: 2924e4 }
                      ],
                      balance: 271954540
                    },
                    { id: "total_account_payables", description: "Total Account Payables", balance: 271954540, isTotal: true }
                  ]
                },
                {
                  id: "other_current_liabilities",
                  description: "Other Current Liabilities",
                  isHeader: true,
                  children: [
                    { id: "ppn_keluaran", description: "PPN Keluaran", balance: 795e3 },
                    {
                      id: "hutang_biaya",
                      description: "Hutang Biaya",
                      children: [
                        { id: "hutang_bunga", description: "Hutang Bunga", balance: 5e7 },
                        { id: "hutang_gaji", description: "Hutang Gaji", balance: 125e5 },
                        { id: "hutang_sewa_alat", description: "Hutang Sewa Alat Proyek", balance: 12332795 },
                        { id: "hutang_biaya_proyek", description: "Hutang Biaya Proyek Lain-lain", balance: 19842e3 },
                        { id: "hutang_gaji_proyek", description: "Hutang Gaji/Upah Karyawan Proyek", balance: 197573290 }
                      ],
                      balance: 292248085
                    },
                    { id: "total_other_current_liabilities", description: "Total Other Current Liabilities", balance: 293043085, isTotal: true }
                  ]
                },
                { id: "total_current_liabilities", description: "Total Current Liabilities", balance: 564997625, isTotal: true }
              ]
            },
            {
              id: "long_term_liabilities",
              description: "Long Term Liabilities",
              isHeader: true,
              children: [
                { id: "hutang_jk_panjang", description: "Hutang Jangka Panjang", balance: 65e7 },
                { id: "total_long_term_liabilities", description: "Total Long Term Liabilities", balance: 65e7, isTotal: true }
              ]
            },
            { id: "total_liabilities", description: "Total LIABILITIES", balance: 1214997625, isTotal: true }
          ]
        },
        {
          id: "equities",
          description: "EQUITIES",
          isHeader: true,
          children: [
            { id: "modal", description: "Modal", balance: 1e9 },
            { id: "deviden", description: "Deviden", balance: 5e8 },
            { id: "laba_ditahan", description: "Laba Ditahan", balance: 28936157286e-2 },
            { id: "current_earning", description: "Current Earning of The Year", balance: -6e5 },
            { id: "total_equities", description: "Total EQUITIES", balance: 178876157286e-2, isTotal: true }
          ]
        },
        { id: "total_liabilities_equities", description: "Total LIABILITIES and EQUITIES", balance: 300375919786e-2, isTotal: true }
      ]
    }
  ];
  var PROFIT_AND_LOSS_DATA = [
    {
      id: "operating_revenue",
      description: "OPERATING REVENUE",
      isHeader: true,
      children: [
        {
          id: "pendapatan",
          description: "Pendapatan Utama",
          isHeader: true,
          children: [
            { id: "pendapatan_jasa_1", description: "Pendapatan Jasa Konsultasi", balance: 5e7 },
            { id: "pendapatan_jasa_2", description: "Pendapatan Jasa Implementasi", balance: 12e7 },
            { id: "pendapatan_jasa_3", description: "Pendapatan Jasa Maintenance", balance: 35e6 }
          ]
        },
        {
          id: "pendapatan_2",
          description: "Pendapatan Barang",
          isHeader: true,
          children: [
            { id: "penjualan", description: "Penjualan Perangkat Keras (Hardware)", balance: 1014e4 },
            { id: "penjualan_2", description: "Penjualan Lisensi Perangkat Lunak", balance: 45e6 },
            { id: "penjualan_3", description: "Penjualan Suku Cadang (Sparepart)", balance: 125e5 },
            { id: "penjualan_4", description: "Penjualan Aksesoris", balance: 32e5 }
          ]
        },
        {
          id: "pengurang_pendapatan",
          description: "Pengurang Pendapatan",
          isHeader: true,
          children: [
            { id: "retur_penjualan", description: "Retur Penjualan", balance: -2e6 },
            { id: "diskon_grosir", description: "Diskon Penjualan Grosir", balance: -15e5 },
            { id: "diskon_promo", description: "Diskon Promosi Event", balance: -35e5 }
          ]
        },
        { id: "total_operating_revenue", description: "Total OPERATING REVENUE", balance: 27034e4, isTotal: true }
      ]
    },
    {
      id: "cogs",
      description: "Cost of Goods Sold",
      isHeader: true,
      children: [
        {
          id: "hpp",
          description: "Harga Pokok Penjualan",
          isHeader: true,
          children: [
            { id: "hpp_item1", description: "HPP Perangkat Keras", balance: 69956155e-1 },
            { id: "hpp_item2", description: "HPP Lisensi Perangkat Lunak", balance: 15e6 },
            { id: "hpp_item3", description: "HPP Suku Cadang", balance: 8e6 },
            { id: "hpp_item4", description: "Biaya Tenaga Kerja Langsung (Proyek)", balance: 25e6 },
            { id: "hpp_item5", description: "Biaya Overhead Pabrikasi", balance: 45e5 },
            { id: "hpp_item6", description: "Biaya Ongkos Kirim Pembelian", balance: 12e5 },
            { id: "hpp_item7", description: "Biaya Pengemasan (Packaging)", balance: 85e4 }
          ]
        },
        { id: "total_cogs", description: "Total Cost of Goods Sold", balance: 615456155e-1, isTotal: true }
      ]
    },
    {
      id: "gross_profit",
      description: "GROSS PROFIT",
      balance: 2087943845e-1,
      isTotal: true
    },
    {
      id: "operating_expenses",
      description: "Operating Expenses",
      isHeader: true,
      children: [
        {
          id: "biaya_umum_adm",
          description: "Biaya Umum & Administrasi",
          isHeader: true,
          children: [
            { id: "biaya_gaji_upah", description: "Biaya Gaji & Upah", balance: 3e7 },
            {
              id: "gaji_tunjangan",
              description: "Gaji & Tunjangan Karyawan",
              isHeader: true,
              children: [
                { id: "biaya_catering", description: "Biaya Catering & Makan Karyawan", balance: 2e5 },
                { id: "biaya_transport", description: "Biaya Transportasi Karyawan", balance: 15e5 },
                { id: "biaya_kesehatan", description: "Tunjangan Kesehatan & Medis", balance: 45e5 },
                { id: "biaya_lembur", description: "Uang Lembur Karyawan", balance: 32e5 },
                { id: "biaya_thr", description: "Tunjangan Hari Raya (THR)", balance: 0 },
                { id: "biaya_bonus", description: "Bonus Kinerja Karyawan", balance: 12e6 }
              ]
            },
            {
              id: "beban_utiliti_adm",
              description: "Beban Utiliti, Adm, Sewa & Lainnya",
              isHeader: true,
              children: [
                { id: "biaya_listrik", description: "Biaya Listrik", balance: 35e4 },
                { id: "biaya_air", description: "Biaya Air Bersih (PAM)", balance: 12e4 },
                { id: "biaya_internet", description: "Biaya Internet & Komunikasi", balance: 85e4 },
                { id: "biaya_sewa", description: "Biaya Sewa Gedung", balance: 15e6 },
                { id: "biaya_asuransi", description: "Biaya Asuransi Gedung", balance: 25e5 },
                { id: "biaya_kebersihan", description: "Biaya Kebersihan & Keamanan", balance: 1e6 },
                { id: "biaya_atk", description: "Biaya Alat Tulis Kantor (ATK)", balance: 125e4 },
                { id: "biaya_fotocopy", description: "Biaya Fotocopy & Pencetakan", balance: 45e4 },
                { id: "biaya_pos", description: "Biaya Kurir & Pos", balance: 8e5 }
              ]
            },
            {
              id: "beban_pemasaran",
              description: "Beban Pemasaran & Promosi",
              isHeader: true,
              children: [
                { id: "iklan_digital", description: "Biaya Iklan Digital (Google/FB)", balance: 12e6 },
                { id: "iklan_cetak", description: "Biaya Cetak Brosur/Banner", balance: 35e5 },
                { id: "biaya_event", description: "Biaya Pameran & Event", balance: 8e6 },
                { id: "biaya_entertainment", description: "Biaya Entertainment Klien", balance: 42e5 },
                { id: "biaya_sponsor", description: "Biaya Sponsorship", balance: 5e6 }
              ]
            },
            {
              id: "beban_penyusutan",
              description: "Beban Penyusutan",
              isHeader: true,
              children: [
                { id: "penyusutan_bangunan", description: "Penyusutan Bangunan", balance: 5e6 },
                { id: "penyusutan_kendaraan", description: "Penyusutan Kendaraan", balance: 35e5 },
                { id: "penyusutan_peralatan", description: "Penyusutan Peralatan Kantor", balance: 12e5 },
                { id: "penyusutan_komputer", description: "Penyusutan Perangkat Komputer", balance: 28e5 }
              ]
            },
            {
              id: "beban_kendaraan",
              description: "Beban Operasional Kendaraan",
              isHeader: true,
              children: [
                { id: "bbm_kendaraan", description: "Biaya BBM Kendaraan", balance: 45e5 },
                { id: "service_kendaraan", description: "Biaya Perawatan & Service", balance: 25e5 },
                { id: "pajak_kendaraan", description: "Biaya Pajak & STNK", balance: 18e5 },
                { id: "tol_parkir", description: "Biaya Tol & Parkir", balance: 95e4 }
              ]
            }
          ]
        },
        { id: "total_operating_expenses", description: "Total Operating Expenses", balance: 12867e4, isTotal: true }
      ]
    },
    {
      id: "income_from_operation",
      description: "INCOME FROM OPERATION",
      balance: 801243845e-1,
      isTotal: true
    },
    {
      id: "other_income_expenses",
      description: "Other Income and Expenses",
      isHeader: true,
      children: [
        {
          id: "other_income",
          description: "Other Income",
          isHeader: true,
          children: [
            { id: "pendapatan_bunga", description: "Pendapatan Bunga Bank", balance: 25e5 },
            { id: "laba_kurs", description: "Laba Selisih Kurs", balance: 12e5 },
            { id: "pendapatan_sewa", description: "Pendapatan Sewa Ruangan", balance: 5e6 }
          ]
        },
        { id: "total_other_income", description: "Total Other Income", balance: 87e5, isTotal: true },
        {
          id: "other_expenses",
          description: "Other Expenses",
          isHeader: true,
          children: [
            {
              id: "biaya_lain_lain",
              description: "Biaya Lain-lain",
              isHeader: true,
              children: [
                { id: "biaya_adm_bank", description: "Biaya Administrasi Bank", balance: 15e4 },
                { id: "biaya_buku_cek", description: "Biaya Buku Cek/Giro", balance: 5e4 },
                { id: "rugi_kurs", description: "Rugi Selisih Kurs", balance: 85e4 },
                { id: "biaya_pajak_final", description: "Biaya Pajak Final PPh", balance: 125e4 },
                { id: "biaya_notaris", description: "Biaya Legal & Notaris", balance: 5e6 },
                { id: "biaya_denda", description: "Biaya Denda Keterlambatan", balance: 35e4 },
                { id: "biaya_csr", description: "Biaya Sumbangan / CSR", balance: 2e6 }
              ]
            }
          ]
        },
        { id: "total_other_expenses", description: "Total Other Expenses", balance: 965e4, isTotal: true },
        { id: "total_other_income_expenses_net", description: "Total Other Income and Expenses", balance: -95e4, isTotal: true }
      ]
    },
    { id: "net_profit_before_tax", description: "NET PROFIT/LOSS (Before Tax)", balance: 791743845e-1, isTotal: true },
    { id: "net_profit_after_tax", description: "NET PROFIT/LOSS (After Tax)", balance: 791743845e-1, isTotal: true }
  ];
  var generateCashFlowDetailData = () => [
    {
      id: "Operating Activities",
      description: "",
      isHeader: true,
      children: [
        { id: "Net Income", description: "(From Profit & Loss Statement)", balance: -7482966992e-2 },
        {
          id: "Added",
          description: "",
          isHeader: true,
          children: [
            {
              id: "Accumulated Depreciation",
              description: "",
              isHeader: true,
              children: [
                { id: "1202-001", description: "Akum. Penys. Bangunan", balance: 375e5 },
                { id: "1202-002", description: "Akum. Penys. Peralatan Kantor", balance: 433333333e-2 },
                { id: "1202-003", description: "Akum. Penys. Peralatan Toko", balance: 591666667e-2 },
                { id: "1202-004", description: "Akum. Penys. Kendaraan", balance: 2647966992e-2 },
                { id: "Total of Accumulated Depreciation", description: "", balance: 7422966992e-2, isTotal: true }
              ]
            },
            { id: "Total of Added", description: "", balance: 7422966992e-2, isTotal: true }
          ]
        },
        { id: "Total of Operating Activities", description: "", balance: 7422966992e-2, isTotal: true }
      ]
    },
    { id: "Total of Net Cash Provide (Used) in This Period", description: "", balance: -6e5 },
    { id: "Total of Cash & Cash Equivalent at Beginning of Period", description: "", balance: 97459857225e-2 },
    { id: "Total of Cash & Cash Equivalent at End of Period", description: "", balance: 97399857225e-2 }
  ];
  var generateCashFlowSummaryData = () => [
    { id: "cfs_op", description: "Net Cash Flow from Operating Activities", balance: 45e7, isHeader: true, children: [] },
    { id: "cfs_inv", description: "Net Cash Flow from Investing Activities", balance: -12e7, isHeader: true, children: [] },
    { id: "cfs_fin", description: "Net Cash Flow from Financing Activities", balance: -5e7, isHeader: true, children: [] },
    { id: "cfs_net", description: "Net Increase/Decrease in Cash", balance: 28e7, isTotal: true }
  ];
  var generateOwnerEquityData = (year) => [
    { id: "beginning_capital", description: `Owner's Capital, Jan 1, ${year}`, balance: 5e8 },
    {
      id: "additions",
      description: "Additions:",
      isHeader: true,
      children: [
        { id: "net_income", description: "Net Income for the Year", balance: 15566591976e-2 },
        { id: "additional_investments", description: "Additional Investments", balance: 5e7 },
        { id: "total_additions", description: "Total Additions", balance: 20566591976e-2, isTotal: true }
      ]
    },
    { id: "subtotal_capital", description: "Subtotal", balance: 70566591976e-2, isTotal: true },
    {
      id: "deductions",
      description: "Deductions:",
      isHeader: true,
      children: [
        { id: "owner_drawings", description: `Owner's Drawings`, balance: -25e6 },
        { id: "total_deductions", description: "Total Deductions", balance: -25e6, isTotal: true }
      ]
    },
    { id: "ending_capital", description: `Owner's Capital, Dec 31, ${year}`, balance: 68066591976e-2, isTotal: true }
  ];
  var generateFinancialHighlightData = (year) => [
    { id: "total_revenues", description: "Total Revenues", balances: [0, 19072708226e-2, -100] },
    { id: "operating_income", description: "Operating Income", balances: [-2e5, 15566591976e-2, -100.13] },
    { id: "net_income", description: "Net Income", balances: [-8958161914e-2, 5275042757e-2, -269.82] },
    { id: "working_capital", description: "Working Capital", balances: [11030690963e-1, 11036690963e-1, -0.05] },
    { id: "current_ratio", description: "Current Ratio", balances: [2.95, 2.95, -0.04] },
    { id: "long_term_liability", description: "Long Term Liability", balances: [0.43, 0.43, 0] },
    { id: "equity", description: "Equity", balances: [1520096244, 1520096244, 0] }
  ];
  var generateRetainedEarningData = (year) => [
    { id: "beg_bal", description: `Retained Earning (Beginning - ${year})`, balance: 28936157286e-2 },
    {
      id: "net_income_year",
      description: `Net Income Of The Year (Year ${year})`,
      isHeader: true,
      children: [
        { id: "jan", description: "January", balance: 0 },
        { id: "feb", description: "February", balance: 0 },
        { id: "mar", description: "March", balance: 0 },
        { id: "apr", description: "April", balance: 0 },
        { id: "may", description: "May", balance: 0 },
        { id: "jun", description: "June", balance: 0 },
        { id: "jul", description: "July", balance: 0 },
        { id: "aug", description: "August", balance: 0 },
        { id: "sep", description: "September", balance: 0 },
        { id: "oct", description: "October", balance: -7482966992e-2 },
        { id: "nov", description: "November", balance: 0 },
        { id: "dec", description: "December", balance: -1475194922e-2 },
        { id: "total_ni", description: `Total Net Income of The Year (Year ${year})`, balance: -8958161914e-2, isTotal: true }
      ]
    },
    { id: "change_txn", description: `Change Transaction Balance of Retained Earning Year ${year}`, balance: 0 },
    { id: "inc_dec", description: `Increase (Decrease) of the Retained Earning ${year}`, balance: -8958161914e-2 },
    { id: "end_bal", description: `Retained Earning (End of Period ${year})`, balance: 19977995372e-2, isTotal: true }
  ];
  var generateMultiPeriodData = (nodes, count, includeTotal = false) => {
    return nodes.map((node) => {
      const newNode = { ...node };
      if (newNode.balance !== void 0) {
        const periods = Array.from({ length: count }).map((_, i) => newNode.balance * (0.8 + 0.1 * i));
        if (includeTotal) {
          const total = periods.reduce((sum, val) => sum + val, 0);
          newNode.balances = [...periods, total];
        } else {
          newNode.balances = periods;
        }
      }
      if (newNode.children) {
        newNode.children = generateMultiPeriodData(newNode.children, count, includeTotal);
      }
      return newNode;
    });
  };
  var generateBudgetData = (nodes, count, includeTotal = false) => {
    return nodes.map((node) => {
      const newNode = { ...node };
      if (newNode.balance !== void 0) {
        const periods = Array.from({ length: count }).map((_, i) => newNode.balance * (1.15 + 0.05 * i));
        if (includeTotal) {
          newNode.balances = [...periods, periods.reduce((sum, val) => sum + val, 0)];
        } else {
          newNode.balances = periods;
        }
      }
      if (newNode.children) {
        newNode.children = generateBudgetData(newNode.children, count, includeTotal);
      }
      return newNode;
    });
  };
  var generateCompareBudgetData = (nodes) => {
    return nodes.map((node) => {
      const newNode = { ...node };
      if (newNode.balance !== void 0) {
        newNode.balances = [newNode.balance, newNode.balance * 1.15];
      }
      if (newNode.children) {
        newNode.children = generateCompareBudgetData(newNode.children);
      }
      return newNode;
    });
  };
  var generateConsolidationData = (nodes) => {
    return nodes.map((node) => {
      const newNode = { ...node };
      if (newNode.balance !== void 0) {
        newNode.balances = [newNode.balance, newNode.balance * 0.45, newNode.balance * 1.45];
      }
      if (newNode.children) newNode.children = generateConsolidationData(newNode.children);
      return newNode;
    });
  };
  var generateCompareBudgetPeriodData = (nodes, count, includeTotal = false) => {
    return nodes.map((node) => {
      const newNode = { ...node };
      if (newNode.balance !== void 0) {
        const periods = [];
        let totalAct = 0;
        let totalBud = 0;
        for (let i = 0; i < count; i++) {
          const act = newNode.balance * (0.8 + 0.1 * i);
          const bud = act * 1.15;
          periods.push(act, bud);
          totalAct += act;
          totalBud += bud;
        }
        if (includeTotal) {
          newNode.balances = [...periods, totalAct, totalBud];
        } else {
          newNode.balances = periods;
        }
      }
      if (newNode.children) newNode.children = generateCompareBudgetPeriodData(newNode.children, count, includeTotal);
      return newNode;
    });
  };

  // src/features/gl/components/reports/viewer/utils.ts
  var formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };
  var getInitialExpandedNodes = (nodes) => {
    const set = /* @__PURE__ */ new Set();
    const traverse = (n) => {
      if (n.children && n.children.length > 0) {
        set.add(n.id);
        n.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return set;
  };
  var getVisibleRows = (nodes, expandedSet, level = 0) => {
    let rows = [];
    for (const node of nodes) {
      rows.push({ node, level });
      if (expandedSet.has(node.id) && node.children && node.children.length > 0) {
        rows = rows.concat(getVisibleRows(node.children, expandedSet, level + 1));
      }
    }
    return rows;
  };
  var yAxisFormatter = (val) => {
    const absVal = Math.abs(val);
    if (absVal >= 1e12) return `${(val / 1e12).toFixed(1)} T`;
    if (absVal >= 1e9) return `${(val / 1e9).toFixed(1)} M`;
    if (absVal >= 1e6) return `${(val / 1e6).toFixed(1)} Jt`;
    if (absVal >= 1e3) return `${(val / 1e3).toFixed(0)} Rb`;
    return val.toString();
  };

  // src/features/gl/components/reports/viewer/components/ReportRowItemFlat.tsx
  var import_react5 = __toESM(__require("react"), 1);
  var import_lucide_react4 = __require("lucide-react");
  var ReportRowItemFlat = ({ flatNode, isExpanded, onToggle, isMultiPeriod, isCompareMonth, isBudgetPeriod, isCompareBudget, isCommonSized, isConsolidation, isCompareBudgetPeriod, isRetainedEarning, isFinancialHighlight, isCashFlowDetail, totalAssets, isLandscape }) => {
    const { node, level } = flatNode;
    const hasChildren = node.children && node.children.length > 0;
    let rowStyle = "group flex items-center border-b border-transparent hover:bg-blue-50/50 transition-colors cursor-default text-[12px] text-black";
    if (node.isHeader) {
      rowStyle += " font-bold";
    } else if (node.isTotal) {
      rowStyle += " font-bold";
    } else {
      rowStyle += " font-normal";
    }
    const paddingLeft = `${level * 16 + 8}px`;
    return /* @__PURE__ */ import_react5.default.createElement("div", { className: rowStyle }, /* @__PURE__ */ import_react5.default.createElement(
      "div",
      {
        className: `${isLandscape ? "w-[220px] shrink-0" : "flex-1 min-w-[200px]"} py-1 flex items-center gap-1`,
        style: { paddingLeft },
        onClick: () => hasChildren && onToggle()
      },
      hasChildren ? /* @__PURE__ */ import_react5.default.createElement("button", { className: "w-3.5 h-3.5 flex items-center justify-center text-slate-400 hover:text-slate-700 print:hidden" }, isExpanded ? /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.ChevronDown, { className: "w-3 h-3" }) : /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.ChevronRight, { className: "w-3 h-3" })) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-3.5" }),
      isCashFlowDetail ? node.description ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("span", { className: "w-64 shrink-0 pr-2" }, node.id), /* @__PURE__ */ import_react5.default.createElement("span", { className: "flex-1 line-clamp-2" }, node.description)) : /* @__PURE__ */ import_react5.default.createElement("span", { className: "flex-1 line-clamp-2" }, node.id) : /* @__PURE__ */ import_react5.default.createElement("span", { className: "line-clamp-2" }, node.description)
    ), isCompareMonth && node.balances ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[0] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[0]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[1] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[1]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[1] - node.balances[0] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[1] - node.balances[0]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-24 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[1] - node.balances[0] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, node.balances[0] !== 0 ? ((node.balances[1] - node.balances[0]) / Math.abs(node.balances[0]) * 100).toFixed(2) + "%" : "0.00%"))) : isCompareBudget && node.balances ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[0] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[0]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[1] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[1]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[0] - node.balances[1] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[0] - node.balances[1]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-24 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[0] - node.balances[1] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, node.balances[1] !== 0 ? ((node.balances[0] - node.balances[1]) / Math.abs(node.balances[1]) * 100).toFixed(2) + "%" : "0.00%"))) : isCompareBudgetPeriod && node.balances ? node.balances.map((b, i) => /* @__PURE__ */ import_react5.default.createElement("div", { key: i, className: `flex-1 min-w-[65px] py-1 px-1 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${b < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(b)))) : isConsolidation && node.balances ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-40 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[0] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[0]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-40 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[1] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[1]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-40 py-1 px-4 text-right flex flex-col justify-center font-bold` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[2] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[2])))) : isCommonSized && node.balance !== void 0 ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balance < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balance))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-24 py-1 px-4 text-right flex flex-col justify-center font-bold text-blue-800` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balance < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, totalAssets ? (node.balance / totalAssets * 100).toFixed(2) + "%" : "0.00%"))) : (isMultiPeriod || isBudgetPeriod) && node.balances ? node.balances.map((b, i) => /* @__PURE__ */ import_react5.default.createElement("div", { key: i, className: `flex-1 min-w-[70px] py-1 px-1 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${b < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(b)))) : isRetainedEarning ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, node.balance !== void 0 ? /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balance < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balance)) : null), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-24 py-1 px-4 text-center flex flex-col justify-center text-gray-700` }, node.balance !== void 0 || node.isHeader ? /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.isTotal ? "border-t border-transparent" : ""}` }, "1") : null)) : isFinancialHighlight && node.balances ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[0] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[0]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[1] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balances[1]))), /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-32 py-1 px-4 text-right flex flex-col justify-center` }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balances[2] < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, node.balances[2] === 0 ? "0" : formatCurrency(node.balances[2])))) : !(isMultiPeriod || isCompareMonth || isBudgetPeriod || isCompareBudget || isCompareBudgetPeriod || isConsolidation || isCommonSized || isRetainedEarning || isFinancialHighlight) ? /* @__PURE__ */ import_react5.default.createElement("div", { className: `w-40 py-1 px-4 text-right flex flex-col justify-center` }, node.balance !== void 0 ? /* @__PURE__ */ import_react5.default.createElement("span", { className: `inline-block w-full ${node.balance < 0 ? "text-[#e40505]" : ""} ${node.isTotal ? "border-t border-black" : ""}` }, formatCurrency(node.balance)) : null) : isCompareMonth || isCompareBudget ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-24 py-1 px-4 border-l border-transparent print:border-transparent" })) : isCommonSized ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-24 py-1 px-4 border-l border-transparent print:border-transparent" })) : /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-32 py-1 px-4 border-l border-transparent print:border-transparent" })));
  };

  // src/features/gl/components/reports/viewer/components/EnterpriseFinancialChart.tsx
  var import_react6 = __toESM(__require("react"), 1);
  var import_recharts = __require("recharts");
  var import_lucide_react5 = __require("lucide-react");
  var EnterpriseCustomTooltip = ({ active, payload, label, measure: measure2, compareMode: compareMode2 }) => {
    if (active && payload && payload.length) {
      const isCompare = compareMode2 && compareMode2 !== "none";
      const mainEntries = payload.filter((p) => !p.name.includes("(Prev)"));
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: `bg-white border border-slate-200 p-4 rounded-xl shadow-xl z-50 custom-scrollbar max-h-[350px] overflow-y-auto overflow-x-hidden ${mainEntries.length > 8 ? "min-w-[650px] max-w-[800px]" : mainEntries.length > 4 ? "min-w-[450px] max-w-[600px]" : "min-w-[250px] max-w-[320px]"}` }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "sticky top-0 bg-white/95 backdrop-blur-sm z-10 pb-2 mb-4 border-b border-slate-100" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "font-bold text-slate-800" }, label)), /* @__PURE__ */ import_react6.default.createElement("div", { className: `grid gap-x-6 gap-y-5 pb-2 ${mainEntries.length > 8 ? "grid-cols-3" : mainEntries.length > 4 ? "grid-cols-2" : "grid-cols-1"}` }, mainEntries.map((entry, index) => {
        const prevEntry = isCompare ? payload.find((p) => p.name === `${entry.name} (Prev)`) : null;
        let varianceEl = null;
        if (prevEntry) {
          const diff = entry.value - prevEntry.value;
          const pct = prevEntry.value !== 0 ? diff / prevEntry.value * 100 : 0;
          const isPos = diff >= 0;
          varianceEl = /* @__PURE__ */ import_react6.default.createElement("div", { className: `text-[11px] font-bold mt-1.5 mb-1 ${isPos ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"} px-2 py-1 rounded inline-block` }, isPos ? "\u25B2" : "\u25BC", " ", Math.abs(pct).toFixed(1), "% (", measure2 === "count" ? `${new Intl.NumberFormat("id-ID").format(diff)} Trx` : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(diff), ")");
        }
        return /* @__PURE__ */ import_react6.default.createElement("div", { key: index, className: "flex flex-col" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider mb-1 truncate max-w-[180px]", style: { color: entry.color }, title: entry.name }, entry.name), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[14px] font-bold text-slate-800 leading-none" }, measure2 === "count" ? `${new Intl.NumberFormat("id-ID").format(entry.value)} Trx` : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(entry.value)), prevEntry && /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[10px] font-medium text-slate-400 mt-1 line-through" }, "Prev: ", measure2 === "count" ? `${new Intl.NumberFormat("id-ID").format(prevEntry.value)} Trx` : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(prevEntry.value)), /* @__PURE__ */ import_react6.default.createElement("div", null, varianceEl));
      })));
    }
    return null;
  };
  var EnterpriseFinancialChart = ({ reportName, reportParams }) => {
    const isIncExp = reportName.toLowerCase().includes("income and expense");
    const isNetWorth = reportName.toLowerCase().includes("net worth");
    const isLiquidity = reportName.toLowerCase().includes("liquidity");
    const isRoa = reportName.toLowerCase().includes("roa");
    const isRoe = reportName.toLowerCase().includes("roe");
    const isValCmp = reportName.toLowerCase().includes("value comparison");
    const evalYearFull = reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear().toString() : "2026";
    const evalYearShort = evalYearFull.slice(2);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    if (isIncExp) {
      const data = monthNames.map((m, i) => ({
        name: m,
        Income: 12e7 + Math.random() * 5e7,
        Expense: 8e7 + Math.random() * 4e7
      }));
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full h-[500px] mt-8 bg-white border border-slate-200 rounded p-6 shadow-sm" }, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "text-center font-bold mb-6 text-lg" }, "Income vs Expense Trend"), /* @__PURE__ */ import_react6.default.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.AreaChart, { data }, /* @__PURE__ */ import_react6.default.createElement("defs", null, /* @__PURE__ */ import_react6.default.createElement("linearGradient", { id: "colorInc", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react6.default.createElement("stop", { offset: "5%", stopColor: "#2563eb", stopOpacity: 0.8 }), /* @__PURE__ */ import_react6.default.createElement("stop", { offset: "95%", stopColor: "#2563eb", stopOpacity: 0 })), /* @__PURE__ */ import_react6.default.createElement("linearGradient", { id: "colorExp", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react6.default.createElement("stop", { offset: "5%", stopColor: "#e40505", stopOpacity: 0.8 }), /* @__PURE__ */ import_react6.default.createElement("stop", { offset: "95%", stopColor: "#e40505", stopOpacity: 0 }))), /* @__PURE__ */ import_react6.default.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: false }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.XAxis, { dataKey: "name" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.YAxis, { tickFormatter: yAxisFormatter }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ import_react6.default.createElement(EnterpriseCustomTooltip, null) }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Legend, null), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Area, { type: "monotone", dataKey: "Income", stroke: "#2563eb", fillOpacity: 1, fill: "url(#colorInc)" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Area, { type: "monotone", dataKey: "Expense", stroke: "#e40505", fillOpacity: 1, fill: "url(#colorExp)" }))));
    }
    if (isNetWorth) {
      const data = monthNames.map((m) => ({
        name: m,
        Assets: 9e8 + Math.random() * 1e8,
        Liabilities: 3e8 + Math.random() * 5e7,
        NetWorth: 0
      }));
      data.forEach((d) => d.NetWorth = d.Assets - d.Liabilities);
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full h-[500px] mt-8 bg-white border border-slate-200 rounded p-6 shadow-sm" }, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "text-center font-bold mb-6 text-lg" }, "Net Worth Growth"), /* @__PURE__ */ import_react6.default.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.ComposedChart, { data }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: false }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.XAxis, { dataKey: "name" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.YAxis, { tickFormatter: yAxisFormatter }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ import_react6.default.createElement(EnterpriseCustomTooltip, null) }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Legend, null), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Bar, { dataKey: "Assets", fill: "#3b82f6" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Bar, { dataKey: "Liabilities", fill: "#ef4444" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Line, { type: "monotone", dataKey: "NetWorth", stroke: "#10b981", strokeWidth: 3 }))));
    }
    if (isLiquidity || isRoa || isRoe) {
      const data = monthNames.map((m) => ({
        name: m,
        Ratio: isLiquidity ? 1.5 + Math.random() : isRoa ? 5 + Math.random() * 5 : 12 + Math.random() * 8,
        Target: isLiquidity ? 1.2 : isRoa ? 8 : 15
      }));
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full h-[500px] mt-8 bg-white border border-slate-200 rounded p-6 shadow-sm" }, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "text-center font-bold mb-6 text-lg" }, isLiquidity ? "Liquidity Ratio" : isRoa ? "Return on Assets (%)" : "Return on Equity (%)"), /* @__PURE__ */ import_react6.default.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.LineChart, { data }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: false }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.XAxis, { dataKey: "name" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.YAxis, null), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Tooltip, null), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Legend, null), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Line, { type: "monotone", dataKey: "Ratio", stroke: "#2563eb", strokeWidth: 3 }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Line, { type: "dashed", dataKey: "Target", stroke: "#64748b", strokeWidth: 2 }))));
    }
    const [chartType2, setChartType2] = (0, import_react6.useState)("line");
    const [showLabels, setShowLabels] = (0, import_react6.useState)(false);
    const [showBrush, setShowBrush] = (0, import_react6.useState)(false);
    const [showRefLine, setShowRefLine] = (0, import_react6.useState)(false);
    const [customTarget, setCustomTarget] = (0, import_react6.useState)("");
    const [drilldownData, setDrilldownData] = (0, import_react6.useState)(null);
    const [measure2, setMeasure2] = (0, import_react6.useState)("balance");
    const [dimension2, setDimension2] = (0, import_react6.useState)("month");
    const [compareMode2, setCompareMode2] = (0, import_react6.useState)("none");
    const [splitAccounts, setSplitAccounts] = (0, import_react6.useState)(["Beban Komisi Penjualan", "Biaya Gaji & Upah"]);
    const [isSplitDropdownOpen, setIsSplitDropdownOpen] = (0, import_react6.useState)(false);
    const [hiddenCategories, setHiddenCategories] = (0, import_react6.useState)([]);
    const toggleCategory = (cat) => {
      setHiddenCategories(
        (prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      );
    };
    const AVAILABLE_ACCOUNTS = [
      "Beban Komisi Penjualan",
      "Biaya Gaji & Upah",
      "Aktiva Tetap",
      "Akun Penys. Bangunan",
      "Akun Silang",
      "Asuransi Dibayar Dimuka",
      "BCA IDR",
      "Mandiri IDR",
      "Kas Kecil",
      "Pendapatan Bunga",
      "Piutang Usaha",
      "Hutang Dagang"
    ];
    const komisiBase = [42e6, 5e6, 128e6, 78e6, 39e6, 102e6, 38e6, 103e6, 54e6, 58e6, 15e7, 125e6];
    const gajiBase = [67e6, 64e6, 65e6, 68e6, 67e6, 63e6, 59e6, 59e6, 72e6, 72e6, 72e6, 72e6];
    const countBase = [120, 15, 300, 210, 100, 250, 95, 260, 140, 155, 380, 310];
    const measureMultiplier = measure2 === "debit" ? 1.15 : measure2 === "credit" ? 0.85 : 1;
    const isCount = measure2 === "count";
    const isYtd = measure2 === "ytd";
    const getBaseValue = (idx, type, isPrev = false) => {
      const periodModifier = isPrev ? compareMode2 === "yoy" ? 0.85 : 0.92 : 1;
      const safeIdx = idx % 12;
      if (isCount) return Math.round(countBase[safeIdx] * (type === "komisi" ? 1 : 0.4) * periodModifier);
      return (type === "komisi" ? komisiBase[safeIdx] : gajiBase[safeIdx]) * measureMultiplier * periodModifier;
    };
    const activeCategories2 = splitAccounts.length > 0 ? splitAccounts : ["(No Account Selected)"];
    let processedData = [];
    const accum = {};
    const accumPrev = {};
    activeCategories2.forEach((cat) => {
      accum[cat] = 0;
      accumPrev[cat] = 0;
    });
    const pushData = (label, startIndex, numMonths, divisor = 1) => {
      const node = { name: label };
      activeCategories2.forEach((cat, idx) => {
        const varianceMod = 1 + idx * 0.15 - (idx % 2 === 0 ? 0 : 0.05);
        let v = 0;
        let vPrev = 0;
        for (let i = 0; i < numMonths; i++) {
          v += getBaseValue(startIndex + i, idx % 2 === 0 ? "komisi" : "gaji") * varianceMod;
          vPrev += getBaseValue(startIndex + i, idx % 2 === 0 ? "komisi" : "gaji", true) * varianceMod;
        }
        v = v / divisor;
        vPrev = vPrev / divisor;
        accum[cat] += v;
        accumPrev[cat] += vPrev;
        node[cat] = isYtd ? accum[cat] : v;
        if (compareMode2 !== "none") {
          node[`${cat} (Prev)`] = isYtd ? accumPrev[cat] : vPrev;
        }
      });
      processedData.push(node);
    };
    if (dimension2 === "date") {
      for (let i = 1; i <= 31; i++) pushData(`${i} Jan '${evalYearShort}`, Math.floor(i / 3), 1, 10);
    } else if (dimension2 === "week") {
      for (let i = 1; i <= 12; i++) pushData(`W${i} '${evalYearShort}`, i, 1, 4);
    } else if (dimension2 === "month") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach((m, i) => pushData(`${m} '${evalYearShort}`, i, 1));
    } else if (dimension2 === "quarter") {
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      quarters.forEach((q, i) => pushData(`${q} '${evalYearShort}`, i * 3, 3));
    } else if (dimension2 === "semester") {
      const semesters = ["H1", "H2"];
      semesters.forEach((s, i) => pushData(`${s} '${evalYearShort}`, i * 6, 6));
    } else {
      pushData(`FY '${evalYearShort}`, 0, 12);
    }
    const ENTERPRISE_COLORS = [
      "#5899DA",
      "#E8743B",
      "#19A979",
      "#ED4A7B",
      "#945ECF",
      "#13A4B4",
      "#525DF4",
      "#BF399E",
      "#6C8893",
      "#EE6868",
      "#2F6497",
      "#CC7B3A",
      "#2DA549",
      "#D64639",
      "#7E4E9E"
    ];
    const getChartColor = (idx, type = "main") => {
      if (idx < ENTERPRISE_COLORS.length) {
        const hex = ENTERPRISE_COLORS[idx];
        if (type === "prevBar") return hex + "66";
        if (type === "prevLine") return hex + "99";
        return hex;
      }
      const hue = idx * 137.508 % 360;
      if (type === "prevBar") return `hsla(${hue}, 70%, 50%, 0.4)`;
      if (type === "prevLine") return `hsla(${hue}, 70%, 50%, 0.6)`;
      return `hsl(${hue}, 70%, 50%)`;
    };
    let totalSum = 0;
    let totalCount = 0;
    if (processedData.length > 0 && activeCategories2.length > 0) {
      processedData.forEach((curr) => {
        activeCategories2.forEach((cat) => {
          totalSum += curr[cat] || 0;
          totalCount++;
        });
      });
    }
    const avgValue = totalCount > 0 ? totalSum / totalCount : 0;
    const finalTargetValue = customTarget !== "" ? customTarget : avgValue;
    const generateSmartInsights = () => {
      if (processedData.length === 0 || activeCategories2.length === 0) return null;
      const visibleCategories = activeCategories2.filter((c) => !hiddenCategories.includes(c));
      if (visibleCategories.length === 0) return null;
      const catTotals = {};
      visibleCategories.forEach((cat) => catTotals[cat] = 0);
      let highestPoint = { cat: "", month: "", value: -Infinity };
      let lowestPoint = { cat: "", month: "", value: Infinity };
      let currentTotalSum = 0;
      let currentTotalCount = 0;
      processedData.forEach((d) => {
        visibleCategories.forEach((cat) => {
          const val = d[cat] || 0;
          catTotals[cat] += val;
          currentTotalSum += val;
          currentTotalCount++;
          if (val > highestPoint.value) highestPoint = { cat, month: d.name, value: val };
          if (val < lowestPoint.value) lowestPoint = { cat, month: d.name, value: val };
        });
      });
      const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
      const topCat = sortedCats[0];
      const formatVal = (v) => measure2 === "count" ? `${new Intl.NumberFormat("id-ID").format(v)} Trx` : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
      const spread = highestPoint.value - lowestPoint.value;
      const currentAvg = currentTotalCount > 0 ? currentTotalSum / currentTotalCount : 0;
      let trendText = "";
      if (processedData.length >= 2) {
        const mid = Math.floor(processedData.length / 2);
        const firstHalfSum = processedData.slice(0, mid).reduce((acc, curr) => acc + visibleCategories.reduce((a, c) => a + (curr[c] || 0), 0), 0);
        const secondHalfSum = processedData.slice(mid).reduce((acc, curr) => acc + visibleCategories.reduce((a, c) => a + (curr[c] || 0), 0), 0);
        if (secondHalfSum > firstHalfSum * 1.05) trendText = "Berdasarkan komparasi antar periode, grafik menunjukkan **Pertumbuhan Positif (Growth Area)** pada separuh akhir masa periode berjalan.";
        else if (secondHalfSum < firstHalfSum * 0.95) trendText = "Berdasarkan komparasi antar periode, grafik mengindikasikan adanya **Perlambatan Aktivitas (Deceleration)** pada separuh akhir masa periode berjalan.";
        else trendText = "Secara umum, konsistensi metrik berada pada tingkat yang **Relatif Stabil & Konstan** di sepanjang periode analitis.";
      }
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "mt-8 mb-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm max-w-5xl mx-auto break-inside-avoid print:shadow-none" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center justify-between mb-4 border-b border-slate-100 pb-3" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "text-blue-600" }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.Sparkles, { className: "w-5 h-5" })), /* @__PURE__ */ import_react6.default.createElement("h4", { className: "font-extrabold text-[18px] text-slate-800 tracking-tight" }, "Executive Summary & Insights"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-5" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "bg-slate-50/70 border border-slate-100 p-3 rounded-lg" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wide" }, "Total Aggregate"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[14px] font-extrabold text-slate-800 mt-1 truncate", title: formatVal(currentTotalSum) }, formatVal(currentTotalSum))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "bg-slate-50/70 border border-slate-100 p-3 rounded-lg" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wide" }, "Period Average"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[14px] font-extrabold text-slate-800 mt-1 truncate", title: formatVal(currentAvg) }, formatVal(currentAvg))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "bg-slate-50/70 border border-slate-100 p-3 rounded-lg" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wide" }, "Peak Value"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[14px] font-extrabold text-slate-800 mt-1 truncate", title: formatVal(highestPoint.value) }, formatVal(highestPoint.value))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "bg-slate-50/70 border border-slate-100 p-3 rounded-lg" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wide" }, "Lowest Value"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[14px] font-extrabold text-slate-800 mt-1 truncate", title: formatVal(lowestPoint.value) }, formatVal(lowestPoint.value)))), /* @__PURE__ */ import_react6.default.createElement("ul", { className: "text-[13px] text-slate-700 space-y-2.5 list-none pl-0 leading-relaxed font-medium" }, /* @__PURE__ */ import_react6.default.createElement("li", { className: "flex items-start gap-2.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-blue-500 mt-0.5" }, "\u2022"), /* @__PURE__ */ import_react6.default.createElement("span", null, "Akun ", /* @__PURE__ */ import_react6.default.createElement("strong", null, topCat[0]), " adalah pendorong operasional utama (Top Contributor) dengan penguasaan porsi metrik agregat sebesar ", /* @__PURE__ */ import_react6.default.createElement("strong", { className: "text-blue-700" }, formatVal(topCat[1])), ".")), /* @__PURE__ */ import_react6.default.createElement("li", { className: "flex items-start gap-2.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-emerald-500 mt-0.5" }, "\u2022"), /* @__PURE__ */ import_react6.default.createElement("span", null, "Kinerja memuncak (*Peak Performance*) tercatat pada akun ", /* @__PURE__ */ import_react6.default.createElement("strong", null, highestPoint.cat), " yang terjadi tepat pada ", /* @__PURE__ */ import_react6.default.createElement("strong", null, highestPoint.month), ". Sebaliknya, titik paling rendah (*Lowest Value*) berasal dari akun ", /* @__PURE__ */ import_react6.default.createElement("strong", null, lowestPoint.cat), " yang terjadi pada ", /* @__PURE__ */ import_react6.default.createElement("strong", null, lowestPoint.month), ". Selisih dari kedua titik tersebut menciptakan rentang volatilitas (*Spread*) sebesar ", /* @__PURE__ */ import_react6.default.createElement("strong", null, formatVal(spread)), ".")), trendText && /* @__PURE__ */ import_react6.default.createElement("li", { className: "flex items-start gap-2.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-indigo-500 mt-0.5" }, "\u2022"), /* @__PURE__ */ import_react6.default.createElement("span", null, trendText.split("**").map((part, i) => i % 2 === 1 ? /* @__PURE__ */ import_react6.default.createElement("strong", { key: i, className: "text-indigo-700" }, part) : part))), showRefLine && /* @__PURE__ */ import_react6.default.createElement("li", { className: "flex items-start gap-2.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-rose-500 mt-0.5" }, "\u2022"), /* @__PURE__ */ import_react6.default.createElement("span", null, "Garis ambang (*Target/KPI Benchmark*) sedang diproyeksikan pada level ekuilibrium ", /* @__PURE__ */ import_react6.default.createElement("strong", { className: "text-rose-600" }, formatVal(finalTargetValue)), " sebagai acuan evaluasi komprehensif."))));
    };
    const handleDrilldown = (state) => {
      if (state && state.activePayload && state.activePayload.length > 0) {
        setDrilldownData({
          label: state.activeLabel,
          payload: state.activePayload,
          account: state.activePayload[0].name,
          entries: [
            { date: "12", no: "JV-2609-0142", desc: "Auto-accrual System Entry", debit: state.activePayload[0].value * 0.4, credit: 0 },
            { date: "18", no: "JV-2609-0291", desc: "Manual Adjustment (GL-04)", debit: state.activePayload[0].value * 0.2, credit: 0 },
            { date: "25", no: "JV-2609-0418", desc: "End of Period Closing", debit: state.activePayload[0].value * 0.4, credit: 0 }
          ]
        });
      }
    };
    const renderChart = () => {
      if (chartType2 === "pie") {
        const pieData = activeCategories2.map((cat, idx) => ({
          name: cat,
          value: processedData.reduce((a, b) => a + (b[cat] || 0), 0),
          originalIndex: idx
          // Preserve index so colors match the legend perfectly
        })).filter((d) => !hiddenCategories.includes(d.name));
        return /* @__PURE__ */ import_react6.default.createElement(import_recharts.PieChart, { margin: { top: 20, right: 30, left: 20, bottom: 10 } }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.Tooltip, { formatter: (value) => measure2 === "count" ? `${new Intl.NumberFormat("id-ID").format(value)} Trx` : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value) }), /* @__PURE__ */ import_react6.default.createElement(
          import_recharts.Pie,
          {
            data: pieData,
            cx: "50%",
            cy: "50%",
            labelLine: false,
            outerRadius: 150,
            dataKey: "value",
            label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
          },
          pieData.map((entry, index) => /* @__PURE__ */ import_react6.default.createElement(import_recharts.Cell, { key: `cell-${index}`, fill: getChartColor(entry.originalIndex) }))
        ));
      }
      const props = { data: processedData, margin: { top: 20, right: 30, left: 20, bottom: 10 }, onClick: handleDrilldown, style: { cursor: "pointer" } };
      const children = /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("defs", null, activeCategories2.map((cat, idx) => {
        if (hiddenCategories.includes(cat)) return null;
        const color = getChartColor(idx, "main");
        return /* @__PURE__ */ import_react6.default.createElement("linearGradient", { key: `grad-${idx}`, id: `colorGrad-${idx}`, x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react6.default.createElement("stop", { offset: "5%", stopColor: color, stopOpacity: 0.4 }), /* @__PURE__ */ import_react6.default.createElement("stop", { offset: "95%", stopColor: color, stopOpacity: 0 }));
      })), /* @__PURE__ */ import_react6.default.createElement(import_recharts.CartesianGrid, { strokeDasharray: "3 3", vertical: true, stroke: "#e2e8f0" }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.XAxis, { dataKey: "name", tickLine: false, axisLine: true, tick: { fill: "#475569", fontSize: 12 } }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.YAxis, { tickFormatter: yAxisFormatter, tickLine: false, axisLine: true, tick: { fill: "#475569", fontSize: 12 } }), /* @__PURE__ */ import_react6.default.createElement(import_recharts.Tooltip, { content: /* @__PURE__ */ import_react6.default.createElement(EnterpriseCustomTooltip, { measure: measure2, compareMode: compareMode2 }), cursor: { fill: "rgba(226, 232, 240, 0.4)" } }), showRefLine && /* @__PURE__ */ import_react6.default.createElement(import_recharts.ReferenceLine, { y: finalTargetValue, stroke: "#e40505", strokeDasharray: "4 4", strokeWidth: 2, label: { position: "insideTopLeft", value: customTarget !== "" ? `Target KPI: ${yAxisFormatter(finalTargetValue)}` : `Mean: ${yAxisFormatter(finalTargetValue)}`, fill: "#e40505", fontSize: 11, fontWeight: "bold" } }), showBrush && /* @__PURE__ */ import_react6.default.createElement(import_recharts.Brush, { dataKey: "name", height: 30, stroke: "#cbd5e1", tickFormatter: () => "", travellerWidth: 10, className: "print:hidden" }), activeCategories2.map((cat, idx) => {
        if (hiddenCategories.includes(cat)) return null;
        const color = getChartColor(idx, "main");
        const prevBarColor = getChartColor(idx, "prevBar");
        const prevLineColor = getChartColor(idx, "prevLine");
        const dotProps = { r: 4, strokeWidth: 2, fill: "#fff", stroke: color };
        const activeDotProps = { r: 7, strokeWidth: 0, fill: color, style: { filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))" } };
        return /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, { key: cat }, compareMode2 !== "none" && (chartType2 === "bar" || chartType2 === "composed" && idx === 0 ? /* @__PURE__ */ import_react6.default.createElement(import_recharts.Bar, { dataKey: `${cat} (Prev)`, fill: prevBarColor, radius: [4, 4, 0, 0] }) : /* @__PURE__ */ import_react6.default.createElement(import_recharts.Line, { type: "monotone", dataKey: `${cat} (Prev)`, stroke: prevLineColor, strokeWidth: 2, strokeDasharray: "4 4", dot: false, activeDot: false })), chartType2 === "line" ? /* @__PURE__ */ import_react6.default.createElement(import_recharts.Line, { type: "monotone", dataKey: cat, stroke: color, strokeWidth: 3, dot: dotProps, activeDot: activeDotProps, label: showLabels ? { position: "top", fill: "#64748b", fontSize: 10, formatter: yAxisFormatter } : false }) : chartType2 === "bar" ? /* @__PURE__ */ import_react6.default.createElement(import_recharts.Bar, { dataKey: cat, fill: color, radius: [4, 4, 0, 0], label: showLabels ? { position: "top", fill: "#64748b", fontSize: 10, formatter: yAxisFormatter } : false }) : chartType2 === "composed" ? idx === 0 ? /* @__PURE__ */ import_react6.default.createElement(import_recharts.Bar, { dataKey: cat, fill: color, radius: [4, 4, 0, 0], label: showLabels ? { position: "top", fill: "#64748b", fontSize: 10, formatter: yAxisFormatter } : false }) : /* @__PURE__ */ import_react6.default.createElement(import_recharts.Line, { type: "monotone", dataKey: cat, stroke: color, strokeWidth: 3, dot: dotProps, activeDot: activeDotProps, label: showLabels ? { position: "top", fill: "#64748b", fontSize: 10, formatter: yAxisFormatter } : false }) : /* @__PURE__ */ import_react6.default.createElement(import_recharts.Area, { type: "monotone", dataKey: cat, stroke: color, strokeWidth: 3, fill: `url(#colorGrad-${idx})`, fillOpacity: 1, activeDot: activeDotProps, label: showLabels ? { position: "top", fill: "#64748b", fontSize: 10, formatter: yAxisFormatter } : false }));
      }));
      if (chartType2 === "bar") return /* @__PURE__ */ import_react6.default.createElement(import_recharts.BarChart, { ...props, barGap: 0, barCategoryGap: "15%" }, children);
      if (chartType2 === "area") return /* @__PURE__ */ import_react6.default.createElement(import_recharts.AreaChart, { ...props }, children);
      if (chartType2 === "composed") return /* @__PURE__ */ import_react6.default.createElement(import_recharts.ComposedChart, { ...props, barGap: 0, barCategoryGap: "15%" }, children);
      return /* @__PURE__ */ import_react6.default.createElement(import_recharts.LineChart, { ...props }, children);
    };
    return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full h-full flex flex-col" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full print-graph-scale print:h-auto break-inside-avoid" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "py-3 px-6 border-b border-slate-200 print:hidden flex flex-wrap items-end justify-between gap-4 bg-slate-50/30 rounded-t-lg" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex bg-slate-50 border border-slate-200 p-0.5 rounded-lg shadow-sm h-[32px] items-center" }, /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setChartType2("line"), title: "Line Chart", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType2 === "line" ? "bg-blue-100 text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.TrendingUp, { className: "w-[16px] h-[16px]" })), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setChartType2("bar"), title: "Bar Chart", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType2 === "bar" ? "bg-blue-100 text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.BarChart2, { className: "w-[16px] h-[16px]" })), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setChartType2("area"), title: "Area Chart", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType2 === "area" ? "bg-blue-100 text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.Activity, { className: "w-[16px] h-[16px]" })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-px bg-slate-200 mx-1 h-4" }), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setChartType2("composed"), title: "Composed Chart", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType2 === "composed" ? "bg-blue-100 text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.Layers, { className: "w-[16px] h-[16px]" })), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setChartType2("pie"), title: "Pie Chart", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${chartType2 === "pie" ? "bg-blue-100 text-blue-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.PieChart, { className: "w-[16px] h-[16px]" })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-px bg-slate-200 mx-1 h-4" }), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setShowLabels(!showLabels), title: "Toggle Data Labels", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${showLabels ? "bg-indigo-100 text-indigo-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.Hash, { className: "w-[16px] h-[16px]" })), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-1 bg-white rounded-md p-0.5 border border-transparent transition-all mx-1 h-full" }, /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setShowRefLine(!showRefLine), title: "Toggle Target Line", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${showRefLine ? "bg-rose-100 text-rose-700 font-bold shadow-sm" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.Target, { className: "w-[16px] h-[16px]" })), showRefLine && /* @__PURE__ */ import_react6.default.createElement(
      "input",
      {
        type: "number",
        placeholder: "Auto Mean...",
        value: customTarget,
        onChange: (e) => setCustomTarget(e.target.value === "" ? "" : Number(e.target.value)),
        className: "w-[110px] text-[12px] px-2 h-full border border-slate-200 rounded text-rose-700 placeholder-slate-400 focus:outline-none focus:border-rose-400 bg-white font-bold shadow-inner"
      }
    )), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setShowBrush(!showBrush), title: "Toggle Timeline Zoom (Brush)", className: `px-2 h-full rounded-md transition-all flex items-center justify-center ${showBrush ? "bg-amber-100 text-amber-600 font-bold shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}` }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.Maximize2, { className: "w-[16px] h-[16px]" })))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider" }, "Measure"), /* @__PURE__ */ import_react6.default.createElement("select", { value: measure2, onChange: (e) => setMeasure2(e.target.value), className: "text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors h-[32px]" }, /* @__PURE__ */ import_react6.default.createElement("option", { value: "balance" }, "Account Amount"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "debit" }, "Debit Amount"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "credit" }, "Credit Amount"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "ytd" }, "YTD Accumulation"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "count" }, "Total Data (Count)"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider" }, "Dimension"), /* @__PURE__ */ import_react6.default.createElement("select", { value: dimension2, onChange: (e) => setDimension2(e.target.value), className: "text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors h-[32px]" }, /* @__PURE__ */ import_react6.default.createElement("option", { value: "date" }, "Date (Daily)"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "week" }, "Week"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "month" }, "Month"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "quarter" }, "Quarter"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "semester" }, "Semester"), /* @__PURE__ */ import_react6.default.createElement("option", { value: "year" }, "Year"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-col gap-1.5 relative" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1" }, "Split By ", /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-blue-500", title: "Select multiple accounts to compare" }, "*")), /* @__PURE__ */ import_react6.default.createElement(
      "div",
      {
        className: "text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors flex items-center justify-between min-w-[160px] h-[32px]",
        onClick: () => setIsSplitDropdownOpen(!isSplitDropdownOpen)
      },
      /* @__PURE__ */ import_react6.default.createElement("span", { className: "truncate max-w-[110px]" }, splitAccounts.length === 0 ? "Select Accounts..." : `${splitAccounts.length} Account${splitAccounts.length > 1 ? "s" : ""}`),
      /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-slate-400 text-[10px]" }, "\u25BC")
    ), isSplitDropdownOpen && /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("div", { className: "fixed inset-0 z-40", onClick: () => setIsSplitDropdownOpen(false) }), /* @__PURE__ */ import_react6.default.createElement("div", { className: "absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-lg z-50 p-2 max-h-60 overflow-y-auto" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-2 mb-2 border-b border-slate-100 flex justify-between items-center" }, "Select Accounts", /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setSplitAccounts([]), className: "text-blue-500 hover:text-blue-700 hover:underline" }, "Clear All")), AVAILABLE_ACCOUNTS.map((acc) => /* @__PURE__ */ import_react6.default.createElement("label", { key: acc, className: "flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors" }, /* @__PURE__ */ import_react6.default.createElement(
      "input",
      {
        type: "checkbox",
        checked: splitAccounts.includes(acc),
        onChange: (e) => {
          if (e.target.checked) {
            setSplitAccounts([...splitAccounts, acc]);
          } else {
            setSplitAccounts(splitAccounts.filter((a) => a !== acc));
          }
        },
        className: "w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      }
    ), /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[12px] font-semibold text-slate-700 truncate" }, acc)))))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-col gap-1.5" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1" }, "Compare ", chartType2 === "pie" && /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-rose-500", title: "Locked in Pie Chart mode" }, "*")), /* @__PURE__ */ import_react6.default.createElement(
      "select",
      {
        value: compareMode2,
        onChange: (e) => setCompareMode2(e.target.value),
        disabled: chartType2 === "pie",
        className: "text-[12px] border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 font-bold cursor-pointer shadow-sm hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 h-[32px]"
      },
      /* @__PURE__ */ import_react6.default.createElement("option", { value: "none" }, "None"),
      /* @__PURE__ */ import_react6.default.createElement("option", { value: "yoy" }, "Prev. Year (YoY)"),
      /* @__PURE__ */ import_react6.default.createElement("option", { value: "pop" }, "Prev. Period (PoP)")
    )))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-8 print:px-0 print:pt-12 print:pb-8" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-col items-center mb-6 print:mb-6" }, /* @__PURE__ */ import_react6.default.createElement("h4", { className: "text-[16px] font-bold text-slate-500 mb-1" }, "PT. Rezeki Nadh Fathan"), /* @__PURE__ */ import_react6.default.createElement("h3", { className: "text-center font-extrabold text-[22px] text-slate-800 tracking-tight" }, "Account Value Comparison Graph"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[14px] font-semibold text-slate-500 mt-1" }, dimension2 === "month" ? "Monthly Trend" : dimension2 === "quarter" ? "Quarterly Accumulation" : dimension2 === "semester" ? "Semester Trend" : dimension2 === "week" ? "Weekly Trend" : dimension2 === "date" ? "Daily Trend" : "Fiscal Year Total", " (01 Jan - 31 Dec ", evalYearFull, ")")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-full h-[450px] mb-8" }, /* @__PURE__ */ import_react6.default.createElement(import_recharts.ResponsiveContainer, { width: "100%", height: "100%" }, renderChart())), /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex flex-wrap justify-center gap-x-4 gap-y-3 px-4" }, activeCategories2.map((cat, idx) => {
      const color = getChartColor(idx, "main");
      const isHidden = hiddenCategories.includes(cat);
      return /* @__PURE__ */ import_react6.default.createElement(
        "div",
        {
          key: `legend-${cat}`,
          onClick: () => toggleCategory(cat),
          className: `flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all cursor-pointer select-none shadow-sm hover:shadow-md active:scale-95
                    ${isHidden ? "bg-white border-slate-200 opacity-60 grayscale" : "bg-white border-slate-100"}
                  `
        },
        /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: `w-3 h-3 rounded-full transition-all ${isHidden ? "bg-slate-300" : ""}`, style: { backgroundColor: isHidden ? void 0 : color, boxShadow: isHidden ? "none" : `0 0 8px ${color}66` } }), /* @__PURE__ */ import_react6.default.createElement("span", { className: `text-[12px] font-bold transition-all ${isHidden ? "text-slate-400 line-through" : "text-slate-700"}` }, cat))
      );
    }), compareMode2 !== "none" && /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm ml-2" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center opacity-70" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-3 h-3 rounded-[3px] bg-slate-400" })), /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-[11px] font-bold text-slate-600 tracking-wide uppercase" }, "Warna Pudar = Data Sebelumnya"))), generateSmartInsights(), drilldownData && /* @__PURE__ */ import_react6.default.createElement("div", { className: "fixed inset-0 z-[100] flex items-center justify-center print:hidden" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "absolute inset-0 bg-slate-900/40 backdrop-blur-sm", onClick: () => setDrilldownData(null) }), /* @__PURE__ */ import_react6.default.createElement("div", { className: "bg-white w-[600px] max-w-[90vw] rounded-xl shadow-2xl relative z-10 flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-2 bg-blue-100 text-blue-700 rounded-lg" }, /* @__PURE__ */ import_react6.default.createElement(import_lucide_react5.MousePointerClick, { className: "w-5 h-5" })), /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "font-bold text-slate-800 text-[16px] leading-tight" }, "Ledger Transactions"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-[12px] text-slate-500 font-semibold" }, drilldownData.account, " \u2022 ", drilldownData.label))), /* @__PURE__ */ import_react6.default.createElement("button", { onClick: () => setDrilldownData(null), className: "p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors" }, /* @__PURE__ */ import_react6.default.createElement(X, { className: "w-5 h-5" }))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-6" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "overflow-x-auto border border-slate-200 rounded-lg" }, /* @__PURE__ */ import_react6.default.createElement("table", { className: "w-full text-left text-[12px] text-slate-600" }, /* @__PURE__ */ import_react6.default.createElement("thead", { className: "bg-slate-50 text-slate-700 font-bold border-b border-slate-200" }, /* @__PURE__ */ import_react6.default.createElement("tr", null, /* @__PURE__ */ import_react6.default.createElement("th", { className: "py-2.5 px-4 whitespace-nowrap" }, "Date"), /* @__PURE__ */ import_react6.default.createElement("th", { className: "py-2.5 px-4 whitespace-nowrap" }, "Doc. No"), /* @__PURE__ */ import_react6.default.createElement("th", { className: "py-2.5 px-4 w-full" }, "Description"), /* @__PURE__ */ import_react6.default.createElement("th", { className: "py-2.5 px-4 text-right whitespace-nowrap" }, "Amount (IDR)"))), /* @__PURE__ */ import_react6.default.createElement("tbody", { className: "divide-y divide-slate-100" }, drilldownData.entries.map((entry, i) => /* @__PURE__ */ import_react6.default.createElement("tr", { key: i, className: "hover:bg-blue-50/30 transition-colors" }, /* @__PURE__ */ import_react6.default.createElement("td", { className: "py-3 px-4 font-medium" }, entry.date, " ", drilldownData.label.replace(/['0-9]/g, "").trim(), " '26"), /* @__PURE__ */ import_react6.default.createElement("td", { className: "py-3 px-4 text-blue-600 font-medium hover:underline cursor-pointer" }, entry.no), /* @__PURE__ */ import_react6.default.createElement("td", { className: "py-3 px-4" }, entry.desc), /* @__PURE__ */ import_react6.default.createElement("td", { className: "py-3 px-4 text-right font-bold text-slate-800" }, new Intl.NumberFormat("id-ID").format(entry.debit))))), /* @__PURE__ */ import_react6.default.createElement("tfoot", { className: "bg-slate-50 border-t border-slate-200 font-bold text-slate-800" }, /* @__PURE__ */ import_react6.default.createElement("tr", null, /* @__PURE__ */ import_react6.default.createElement("td", { colSpan: 3, className: "py-3 px-4 text-right uppercase text-[11px] tracking-wider text-slate-500" }, "Total Period Amount"), /* @__PURE__ */ import_react6.default.createElement("td", { className: "py-3 px-4 text-right" }, new Intl.NumberFormat("id-ID").format(drilldownData.payload[0].value))))))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-end" }, /* @__PURE__ */ import_react6.default.createElement("button", { className: "px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2" }, /* @__PURE__ */ import_react6.default.createElement(FileSpreadsheet, { className: "w-4 h-4 text-emerald-600" }), "Export to Excel")))))));
  };

  // src/features/gl/components/reports/viewer/components/IncomeExpenseDashboard.tsx
  var import_react7 = __toESM(__require("react"), 1);
  var import_recharts2 = __require("recharts");
  var import_lucide_react6 = __require("lucide-react");
  var generateAdvancedData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const nextMonths = ["Jan (Est)", "Feb (Est)", "Mar (Est)"];
    const data = [];
    const drillDownData = {};
    let baseIncome = 15e7;
    let baseExpense = 9e7;
    const budgetLimit = 13e7;
    months.forEach((m, i) => {
      const varIncome = baseIncome + (Math.random() * 4e7 - 1e7);
      const expSpike = i === 5 || i === 11 ? 5e7 : 0;
      const varExpense = baseExpense + (Math.random() * 3e7 - 15e6) + expSpike;
      data.push({
        name: m,
        monthIndex: i,
        isPredictive: false,
        actualIncome: varIncome,
        actualExpense: varExpense,
        predIncome: null,
        predExpense: null,
        budgetLimit,
        netProfit: varIncome - varExpense
      });
      drillDownData[m] = {
        income: [
          { name: "Penjualan Produk", value: varIncome * 0.65, color: "#10b981" },
          // emerald-500
          { name: "Jasa & Servis", value: varIncome * 0.25, color: "#34d399" },
          // emerald-400
          { name: "Pendapatan Lain", value: varIncome * 0.1, color: "#6ee7b7" }
          // emerald-300
        ],
        expense: [
          { name: "Gaji Karyawan", value: varExpense * 0.4, color: "#f43f5e" },
          // rose-500
          { name: "Operasional", value: varExpense * 0.35, color: "#fb7185" },
          // rose-400
          { name: "Pajak & Bunga", value: varExpense * 0.15, color: "#fda4af" },
          // rose-300
          { name: "Lain-lain", value: varExpense * 0.1, color: "#fecdd3" }
          // rose-200
        ]
      };
      baseIncome += 2e6;
      baseExpense += 15e5;
    });
    const last3Income = data.slice(-3).reduce((acc, d) => acc + (d.actualIncome || 0), 0) / 3;
    const last3Expense = data.slice(-3).reduce((acc, d) => acc + (d.actualExpense || 0), 0) / 3;
    let predIncBase = last3Income;
    let predExpBase = last3Expense;
    nextMonths.forEach((m, i) => {
      predIncBase *= 1.02;
      predExpBase *= 1.01;
      data.push({
        name: m,
        monthIndex: 12 + i,
        isPredictive: true,
        actualIncome: null,
        actualExpense: null,
        predIncome: predIncBase,
        predExpense: predExpBase,
        budgetLimit,
        netProfit: predIncBase - predExpBase
      });
    });
    const decData = data[11];
    decData.predIncome = decData.actualIncome;
    decData.predExpense = decData.actualExpense;
    return { trendData: data, drillDownData };
  };
  var CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPred = data.isPredictive;
      return /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl min-w-[280px]" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex justify-between items-center mb-3 pb-2 border-b border-slate-100" }, /* @__PURE__ */ import_react7.default.createElement("p", { className: "font-bold text-slate-800 text-sm flex items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Calendar, { className: "w-4 h-4 text-slate-500" }), label, " ", isPred && /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold" }, "Predictive"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: `w-3 h-3 rounded-full ${isPred ? "bg-emerald-300" : "bg-emerald-500"}` }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-sm font-medium text-slate-600" }, "Income")), /* @__PURE__ */ import_react7.default.createElement("span", { className: "font-bold text-slate-800" }, yAxisFormatter(isPred ? data.predIncome : data.actualIncome))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: `w-3 h-3 rounded-full ${isPred ? "bg-rose-300" : "bg-rose-500"}` }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-sm font-medium text-slate-600" }, "Expense")), /* @__PURE__ */ import_react7.default.createElement("span", { className: "font-bold text-slate-800" }, yAxisFormatter(isPred ? data.predExpense : data.actualExpense))), !isPred && data.actualExpense > data.budgetLimit && /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-100 mt-1" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.AlertCircle, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ import_react7.default.createElement("span", null, "Over Budget by ", yAxisFormatter(data.actualExpense - data.budgetLimit))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "pt-2 border-t border-slate-100 flex justify-between items-center" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-sm font-bold text-slate-700" }, "Net Profit"), /* @__PURE__ */ import_react7.default.createElement("span", { className: `font-black ${data.netProfit >= 0 ? "text-indigo-600" : "text-rose-600"}` }, yAxisFormatter(data.netProfit)))), !isPred && /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.MousePointerClick, { className: "w-3 h-3" }), " Click column to view drill-down"));
    }
    return null;
  };
  var IncomeExpenseDashboard = () => {
    const { trendData, drillDownData } = (0, import_react7.useMemo)(() => generateAdvancedData(), []);
    const [selectedMonth, setSelectedMonth] = (0, import_react7.useState)("Dec");
    const ytdActuals = trendData.filter((d) => !d.isPredictive);
    const totalIncome = ytdActuals.reduce((sum, d) => sum + (d.actualIncome || 0), 0);
    const totalExpense = ytdActuals.reduce((sum, d) => sum + (d.actualExpense || 0), 0);
    const totalNet = totalIncome - totalExpense;
    const netMargin = totalNet / totalIncome * 100;
    const currentDrillDown = drillDownData[selectedMonth];
    const handleChartClick = (state) => {
      if (state && state.activePayload && state.activePayload.length) {
        const data = state.activePayload[0].payload;
        if (!data.isPredictive && drillDownData[data.name]) {
          setSelectedMonth(data.name);
        }
      }
    };
    return /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-full bg-slate-50/50 p-6 rounded-2xl border border-slate-200" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "text-2xl font-black text-slate-800 flex items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Activity, { className: "w-7 h-7 text-indigo-600" }), "Financial Overview Page (OVP)"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-slate-500 text-sm mt-1" }, "Enterprise-grade Income & Expense Analytics with AI Forecasting")), /* @__PURE__ */ import_react7.default.createElement("button", { className: "flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium text-sm" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Download, { className: "w-4 h-4 text-slate-500" }), " Export Forecast")), /* @__PURE__ */ import_react7.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" }), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10" }, "Total YTD Income"), /* @__PURE__ */ import_react7.default.createElement("h3", { className: "text-3xl font-black text-slate-800 relative z-10" }, yAxisFormatter(totalIncome)), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-3 flex items-center gap-2 relative z-10" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.TrendingUp, { className: "w-3 h-3 mr-1" }), " +15.4% YoY"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "vs Last Year"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" }), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10" }, "Total YTD Expense"), /* @__PURE__ */ import_react7.default.createElement("h3", { className: "text-3xl font-black text-slate-800 relative z-10" }, yAxisFormatter(totalExpense)), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-3 flex items-center gap-2 relative z-10" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.TrendingUp, { className: "w-3 h-3 mr-1" }), " +4.2% YoY"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "vs Last Year"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" }), /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10" }, "Net Profit Margin"), /* @__PURE__ */ import_react7.default.createElement("h3", { className: "text-3xl font-black text-indigo-700 relative z-10" }, netMargin.toFixed(1), "%"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-3 flex items-center gap-2 relative z-10" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.TrendingUp, { className: "w-3 h-3 mr-1" }), " +2.1% Margin"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "vs Target 20%")))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex justify-between items-center mb-6" }, /* @__PURE__ */ import_react7.default.createElement("h3", { className: "font-bold text-slate-800 text-lg" }, "Predictive Cash Flow Trend"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-4 text-xs font-medium text-slate-600" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-3 h-3 bg-emerald-500 rounded" }), " Actual Income"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-3 h-3 bg-rose-500 rounded" }), " Actual Expense"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-3 h-3 border-2 border-dashed border-slate-400 rounded" }), " AI Forecast"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-full h-[400px]" }, /* @__PURE__ */ import_react7.default.createElement(import_recharts2.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react7.default.createElement(import_recharts2.ComposedChart, { data: trendData, onClick: handleChartClick, margin: { top: 20, right: 30, left: 20, bottom: 5 }, className: "cursor-pointer" }, /* @__PURE__ */ import_react7.default.createElement("defs", null, /* @__PURE__ */ import_react7.default.createElement("linearGradient", { id: "colorIncAct", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react7.default.createElement("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.3 }), /* @__PURE__ */ import_react7.default.createElement("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })), /* @__PURE__ */ import_react7.default.createElement("linearGradient", { id: "colorExpAct", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ import_react7.default.createElement("stop", { offset: "5%", stopColor: "#f43f5e", stopOpacity: 0.3 }), /* @__PURE__ */ import_react7.default.createElement("stop", { offset: "95%", stopColor: "#f43f5e", stopOpacity: 0 }))), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#e2e8f0" }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fill: "#64748b", fontSize: 12 }, dy: 10 }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.YAxis, { tickFormatter: yAxisFormatter, axisLine: false, tickLine: false, tick: { fill: "#64748b", fontSize: 12 }, dx: -10 }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Tooltip, { content: /* @__PURE__ */ import_react7.default.createElement(CustomTooltip, null), cursor: { fill: "rgba(241, 245, 249, 0.4)" } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.ReferenceLine, { y: 13e7, stroke: "#f43f5e", strokeDasharray: "4 4", label: { position: "insideTopLeft", value: "Monthly Budget Limit", fill: "#f43f5e", fontSize: 11, fontWeight: "bold" } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Area, { type: "monotone", dataKey: "actualIncome", stroke: "#10b981", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorIncAct)", activeDot: { r: 6, strokeWidth: 0 } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Area, { type: "monotone", dataKey: "actualExpense", stroke: "#f43f5e", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorExpAct)", activeDot: { r: 6, strokeWidth: 0 } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Line, { type: "monotone", dataKey: "netProfit", stroke: "#4f46e5", strokeWidth: 2, dot: { r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }, activeDot: { r: 6 } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Line, { type: "monotone", dataKey: "predIncome", stroke: "#34d399", strokeWidth: 3, strokeDasharray: "5 5", dot: false, activeDot: { r: 6 } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Line, { type: "monotone", dataKey: "predExpense", stroke: "#fb7185", strokeWidth: 3, strokeDasharray: "5 5", dot: false, activeDot: { r: 6 } }))))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex justify-between items-center mb-6 border-b border-slate-100 pb-4" }, /* @__PURE__ */ import_react7.default.createElement("h3", { className: "font-bold text-slate-800 text-lg flex items-center gap-2" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.PieChart, { className: "w-5 h-5 text-emerald-600" }), "Drill-Down Analysis: ", /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-sm ml-2" }, selectedMonth)), /* @__PURE__ */ import_react7.default.createElement("div", { className: "text-sm text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200" }, /* @__PURE__ */ import_react7.default.createElement(import_lucide_react6.Info, { className: "w-4 h-4 text-slate-400" }), "Click on a month in the chart above to drill down")), currentDrillDown ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 h-[300px]" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex flex-col items-center h-full" }, /* @__PURE__ */ import_react7.default.createElement("h4", { className: "font-bold text-slate-600 text-sm mb-2 text-center uppercase tracking-wider" }, "Income Sources"), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react7.default.createElement(import_recharts2.PieChart, null, /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Tooltip, { formatter: (val) => yAxisFormatter(val), contentStyle: { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Pie, { data: currentDrillDown.income, innerRadius: 60, outerRadius: 90, paddingAngle: 2, dataKey: "value", stroke: "none" }, currentDrillDown.income.map((entry, index) => /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Cell, { key: `cell-${index}`, fill: entry.color }))))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex flex-wrap justify-center gap-3 mt-4" }, currentDrillDown.income.map((entry, idx) => /* @__PURE__ */ import_react7.default.createElement("div", { key: idx, className: "flex items-center gap-1.5 text-xs font-medium text-slate-600" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-2.5 h-2.5 rounded-sm", style: { backgroundColor: entry.color } }), entry.name)))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex flex-col items-center h-full" }, /* @__PURE__ */ import_react7.default.createElement("h4", { className: "font-bold text-slate-600 text-sm mb-2 text-center uppercase tracking-wider" }, "Expense Categories"), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ import_react7.default.createElement(import_recharts2.PieChart, null, /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Tooltip, { formatter: (val) => yAxisFormatter(val), contentStyle: { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" } }), /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Pie, { data: currentDrillDown.expense, innerRadius: 60, outerRadius: 90, paddingAngle: 2, dataKey: "value", stroke: "none" }, currentDrillDown.expense.map((entry, index) => /* @__PURE__ */ import_react7.default.createElement(import_recharts2.Cell, { key: `cell-${index}`, fill: entry.color }))))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex flex-wrap justify-center gap-3 mt-4" }, currentDrillDown.expense.map((entry, idx) => /* @__PURE__ */ import_react7.default.createElement("div", { key: idx, className: "flex items-center gap-1.5 text-xs font-medium text-slate-600" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-2.5 h-2.5 rounded-sm", style: { backgroundColor: entry.color } }), entry.name))))) : /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-full h-32 flex items-center justify-center text-slate-400 italic" }, "Predictive months do not have historical drill-down data.")));
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetStandard.ts
  var BalanceSheetStandard = {
    id: "fs_bs_std",
    title: "Balance Sheet (Standard)",
    generateData: () => BALANCE_SHEET_DATA,
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossStandard.ts
  var ProfitAndLossStandard = {
    id: "fs_pl_std",
    title: "Profit & Loss (Standard)",
    generateData: () => PROFIT_AND_LOSS_DATA,
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/CashFlowSummary.ts
  var CashFlowSummary = {
    id: "fs_cf_sum_indir",
    title: "Statement of Cash Flows Summary (Indirect Method)",
    generateData: () => generateCashFlowSummaryData(),
    layoutConfig: {
      isCashFlowDetail: true
      // using the same UI layout component
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/Graphs/IncomeAndExpenseGraph.ts
  var IncomeAndExpenseGraph = {
    id: "fs_inc_exp_graph",
    title: "Income and Expense Graph",
    isGraphView: true,
    isLandscape: true,
    // Graphs usually need wide view
    generateData: () => [],
    // Graphs get their data directly in the chart component for now
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetParentScontro.ts
  var BalanceSheetParentScontro = {
    id: "fs_bs_parent",
    title: "Balance Sheet (Parent Scontro)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return BALANCE_SHEET_DATA;
    },
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetMultiPeriod.ts
  var BalanceSheetMultiPeriod = {
    id: "fs_bs_multi",
    title: "Balance Sheet (Multi Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateMultiPeriodData(BALANCE_SHEET_DATA, monthDiff, monthDiff > 1);
    },
    layoutConfig: {
      "isMultiPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetCompareMonth.ts
  var BalanceSheetCompareMonth = {
    id: "fs_bs_comp_month",
    title: "Balance Sheet (Compare Month)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateMultiPeriodData(BALANCE_SHEET_DATA, 2);
    },
    layoutConfig: {
      "isCompareMonth": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetBudgetPeriod.ts
  var BalanceSheetBudgetPeriod = {
    id: "fs_bs_budg_per",
    title: "Balance Sheet (Budget Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateBudgetData(BALANCE_SHEET_DATA, monthDiff, monthDiff > 1);
    },
    layoutConfig: {
      "isBudgetPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetCompareBudget.ts
  var BalanceSheetCompareBudget = {
    id: "fs_bs_comp_budg",
    title: "Balance Sheet (Compare Budget)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCompareBudgetData(BALANCE_SHEET_DATA);
    },
    layoutConfig: {
      "isCompareBudget": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetCompareBudgetPeriod.ts
  var BalanceSheetCompareBudgetPeriod = {
    id: "fs_bs_comp_budg_per",
    title: "Balance Sheet (Compare Budget Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCompareBudgetPeriodData(BALANCE_SHEET_DATA, monthDiff, monthDiff > 1);
    },
    layoutConfig: {
      "isCompareBudgetPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetCommonSized.ts
  var BalanceSheetCommonSized = {
    id: "fs_bs_common",
    title: "Balance Sheet (Common Sized)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return BALANCE_SHEET_DATA;
    },
    layoutConfig: {
      "isCommonSized": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/BalanceSheetConsolidation.ts
  var BalanceSheetConsolidation = {
    id: "fs_bs_consol",
    title: "Balance Sheet (Consolidation)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateConsolidationData(BALANCE_SHEET_DATA);
    },
    layoutConfig: {
      "isConsolidation": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossMultiPeriod.ts
  var ProfitAndLossMultiPeriod = {
    id: "fs_pl_multi",
    title: "Profit & Loss (Multi Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateMultiPeriodData(PROFIT_AND_LOSS_DATA, monthDiff, monthDiff > 1);
    },
    layoutConfig: {
      "isMultiPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossComparePeriod.ts
  var ProfitAndLossComparePeriod = {
    id: "fs_pl_comp_per",
    title: "Profit & Loss (Compare Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateMultiPeriodData(PROFIT_AND_LOSS_DATA, 2);
    },
    layoutConfig: {
      "isCompareMonth": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossBudgetPeriod.ts
  var ProfitAndLossBudgetPeriod = {
    id: "fs_pl_budg_per",
    title: "Profit & Loss (Budget Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateBudgetData(PROFIT_AND_LOSS_DATA, monthDiff, monthDiff > 1);
    },
    layoutConfig: {
      "isBudgetPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossCompareBudget.ts
  var ProfitAndLossCompareBudget = {
    id: "fs_pl_comp_budg",
    title: "Profit & Loss (Compare Budget)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCompareBudgetData(PROFIT_AND_LOSS_DATA);
    },
    layoutConfig: {
      "isCompareBudget": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossCompareBudgetPeriod.ts
  var ProfitAndLossCompareBudgetPeriod = {
    id: "fs_pl_comp_budg_per",
    title: "Profit & Loss (Compare Budget Period)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCompareBudgetPeriodData(PROFIT_AND_LOSS_DATA, monthDiff, monthDiff > 1);
    },
    layoutConfig: {
      "isCompareBudgetPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/ProfitAndLossConsolidation.ts
  var ProfitAndLossConsolidation = {
    id: "fs_pl_consol",
    title: "Profit & Loss (Consolidation)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateConsolidationData(PROFIT_AND_LOSS_DATA);
    },
    layoutConfig: {
      "isConsolidation": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/RetainedEarning.ts
  var RetainedEarning = {
    id: "fs_re_std",
    title: "Retained Earning Statement",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateRetainedEarningData(year);
    },
    layoutConfig: {
      "isRetainedEarning": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/FinancialHighlight.ts
  var FinancialHighlight = {
    id: "fs_highlight",
    title: "Financial Highlight",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateFinancialHighlightData(year);
    },
    layoutConfig: {
      "isFinancialHighlight": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/OwnersEquity.ts
  var OwnersEquity = {
    id: "fs_oe_std",
    title: "Statement of Owner's Equity Changes",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateOwnerEquityData(year);
    },
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/CashFlowDetailIndirect.ts
  var CashFlowDetailIndirect = {
    id: "fs_cf_det_indir",
    title: "Statement of Cash Flows Detail (Indirect Method)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCashFlowDetailData();
    },
    layoutConfig: {
      "isCashFlowDetail": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/CashFlowDirect.ts
  var CashFlowDirect = {
    id: "fs_cf_dir",
    title: "Statement of Cash Flows (Direct Method)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCashFlowDetailData();
    },
    layoutConfig: {
      "isCashFlowDetail": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/MonthlyCashFlowDetail.ts
  var MonthlyCashFlowDetail = {
    id: "fs_cf_det_indir_mo",
    title: "Monthly Statement of Cash Flows Detail (Indirect Method)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCashFlowDetailData();
    },
    layoutConfig: {
      "isCashFlowDetail": true,
      "isMultiPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/MonthlyCashFlowDirect.ts
  var MonthlyCashFlowDirect = {
    id: "fs_cf_dir_mo",
    title: "Monthly Statement of Cash Flows (Direct Method)",
    generateData: (params) => {
      const monthDiff = params?.periodFrom && params?.periodTo ? (() => {
        const f = new Date(params.periodFrom);
        const t = new Date(params.periodTo);
        let d = (t.getFullYear() - f.getFullYear()) * 12 + t.getMonth() - f.getMonth() + 1;
        return d < 1 ? 1 : d;
      })() : 3;
      const year = params?.periodTo ? new Date(params.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
      return generateCashFlowDetailData();
    },
    layoutConfig: {
      "isCashFlowDetail": true,
      "isMultiPeriod": true
    }
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/Graphs/AccountValueComparisonGraph.ts
  var AccountValueComparisonGraph = {
    id: "fs_acc_val_graph",
    title: "Account Value Comparison Graph",
    isGraphView: true,
    isLandscape: true,
    generateData: () => [],
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/Graphs/NetWorthGraph.ts
  var NetWorthGraph = {
    id: "fs_nw_graph",
    title: "Net Worth Graph",
    isGraphView: true,
    isLandscape: true,
    generateData: () => [],
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/Graphs/LiquidityRatioGraph.ts
  var LiquidityRatioGraph = {
    id: "fs_liq_graph",
    title: "Liquidity Ratio Graph",
    isGraphView: true,
    isLandscape: true,
    generateData: () => [],
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/Graphs/ReturnOnAssetGraph.ts
  var ReturnOnAssetGraph = {
    id: "fs_roa_graph",
    title: "Return on Asset Graph",
    isGraphView: true,
    isLandscape: true,
    generateData: () => [],
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/FinancialStatements/Graphs/ReturnOnEquityGraph.ts
  var ReturnOnEquityGraph = {
    id: "fs_roe_graph",
    title: "Return On Equity Graph",
    isGraphView: true,
    isLandscape: true,
    generateData: () => [],
    layoutConfig: {}
  };

  // src/features/gl/components/reports/definitions/index.ts
  var ReportDefinitionsRegistry = {
    // We can key them by the exact report name string used in the UI, or by ID.
    // For the POC, we'll map them by the lowercase report name to match existing logic.
    "balance sheet (standard)": BalanceSheetStandard,
    "profit & loss (standard)": ProfitAndLossStandard,
    "profit and loss (standard)": ProfitAndLossStandard,
    // Alias
    "statement of cash flows summary (indirect method)": CashFlowSummary,
    "income and expense graph": IncomeAndExpenseGraph,
    "balance sheet (parent scontro)": BalanceSheetParentScontro,
    "balance sheet (multi period)": BalanceSheetMultiPeriod,
    "balance sheet (compare month)": BalanceSheetCompareMonth,
    "balance sheet (budget period)": BalanceSheetBudgetPeriod,
    "balance sheet (compare budget)": BalanceSheetCompareBudget,
    "balance sheet (compare budget period)": BalanceSheetCompareBudgetPeriod,
    "balance sheet (common sized)": BalanceSheetCommonSized,
    "balance sheet (consolidation)": BalanceSheetConsolidation,
    "profit & loss (multi period)": ProfitAndLossMultiPeriod,
    "profit & loss (compare period)": ProfitAndLossComparePeriod,
    "profit & loss (budget period)": ProfitAndLossBudgetPeriod,
    "profit & loss (compare budget)": ProfitAndLossCompareBudget,
    "profit & loss (compare budget period)": ProfitAndLossCompareBudgetPeriod,
    "profit & loss (consolidation)": ProfitAndLossConsolidation,
    "retained earning statement": RetainedEarning,
    "financial highlight": FinancialHighlight,
    "statement of owner's equity changes": OwnersEquity,
    "statement of cash flows detail (indirect method)": CashFlowDetailIndirect,
    "statement of cash flows (direct method)": CashFlowDirect,
    "monthly statement of cash flows detail (indirect method)": MonthlyCashFlowDetail,
    "monthly statement of cash flows (direct method)": MonthlyCashFlowDirect,
    "account value comparison graph": AccountValueComparisonGraph,
    "net worth graph": NetWorthGraph,
    "liquidity ratio graph": LiquidityRatioGraph,
    "return on asset graph": ReturnOnAssetGraph,
    "return on equity graph": ReturnOnEquityGraph
  };
  var getReportDefinition = (reportName) => {
    const normalized = reportName.toLowerCase().trim();
    return ReportDefinitionsRegistry[normalized] || null;
  };

  // src/features/gl/components/reports/EnterpriseReportViewer.tsx
  var EnterpriseReportViewer = ({ reportName, onClose }) => {
    const [isDropdownOpen, setIsDropdownOpen] = (0, import_react8.useState)(false);
    const [isRefreshing, setIsRefreshing] = (0, import_react8.useState)(false);
    const [showAdvancedSelection, setShowAdvancedSelection] = (0, import_react8.useState)(false);
    const [showMemorizeModal, setShowMemorizeModal] = (0, import_react8.useState)(false);
    const [showToast, setShowToast] = (0, import_react8.useState)(false);
    const [toastMessage, setToastMessage] = (0, import_react8.useState)({ title: "", desc: "" });
    const [showGraphView, setShowGraphView] = (0, import_react8.useState)(false);
    const [showPresetModal, setShowPresetModal] = (0, import_react8.useState)(false);
    const [activeFeatureModal, setActiveFeatureModal] = (0, import_react8.useState)(null);
    const definition = import_react8.default.useMemo(() => getReportDefinition(reportName), [reportName]);
    const layoutConfig = definition?.layoutConfig || {};
    const isBalanceSheet = reportName.toLowerCase().includes("balance sheet");
    const isProfitAndLoss = reportName.toLowerCase().includes("profit & loss") || reportName.toLowerCase().includes("profit and loss");
    const isMultiPeriod = layoutConfig.isMultiPeriod || reportName.toLowerCase().includes("multi period");
    const isCompareMonth = layoutConfig.isCompareMonth || reportName.toLowerCase().includes("compare month") || reportName.toLowerCase().includes("compare period");
    const isBudgetPeriod = layoutConfig.isBudgetPeriod || reportName.toLowerCase().includes("budget period") && !reportName.toLowerCase().includes("compare");
    const isCompareBudget = layoutConfig.isCompareBudget || reportName.toLowerCase().includes("compare budget") && !reportName.toLowerCase().includes("period");
    const isCompareBudgetPeriod = layoutConfig.isCompareBudgetPeriod || reportName.toLowerCase().includes("compare budget period");
    const isCommonSized = layoutConfig.isCommonSized || reportName.toLowerCase().includes("common sized");
    const isConsolidation = layoutConfig.isConsolidation || reportName.toLowerCase().includes("consolidation");
    const isParentScontro = reportName.toLowerCase().includes("parent scontro");
    const isRetainedEarning = layoutConfig.isRetainedEarning || reportName.toLowerCase().includes("retained earning");
    const isOwnerEquity = reportName.toLowerCase().includes("owner's equity");
    const isFinancialHighlight = layoutConfig.isFinancialHighlight || reportName.toLowerCase().includes("highlight");
    const isCashFlowDetail = layoutConfig.isCashFlowDetail || reportName.toLowerCase().includes("cash flows detail");
    const isCashFlowSummary = layoutConfig.isCashFlowSummary || reportName.toLowerCase().includes("cash flows summary");
    const isGraphView = definition?.isGraphView || reportName.toLowerCase().includes("graph");
    const [reportParams, setReportParams] = (0, import_react8.useState)(null);
    (0, import_react8.useEffect)(() => {
      try {
        const stored = localStorage.getItem("currentReportParams");
        if (stored) setReportParams(JSON.parse(stored));
      } catch (e) {
      }
    }, []);
    const monthDiff = import_react8.default.useMemo(() => {
      let diff = 3;
      if (reportParams?.periodFrom && reportParams?.periodTo) {
        const from = new Date(reportParams.periodFrom);
        const to = new Date(reportParams.periodTo);
        diff = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;
        if (diff < 1) diff = 1;
      }
      return diff;
    }, [reportParams]);
    const multiPeriodHeaders = import_react8.default.useMemo(() => {
      const headers = [];
      if (reportParams?.periodFrom) {
        const from = new Date(reportParams.periodFrom);
        for (let i = 0; i < monthDiff; i++) {
          const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
          headers.push(d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }));
        }
      } else {
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        headers.push(`Apr ${currentYear}`, `May ${currentYear}`, `Jun ${currentYear}`);
      }
      return headers;
    }, [reportParams, monthDiff]);
    const reportData = import_react8.default.useMemo(() => {
      if (definition && definition.generateData) {
        return definition.generateData(reportParams);
      }
      return [];
    }, [definition, reportParams]);
    const totalAssets = import_react8.default.useMemo(() => {
      if (!isCommonSized) return 0;
      let total = 0;
      const findTotal = (nodes) => {
        for (const n of nodes) {
          if (n.description.toLowerCase().includes("aset") || n.description.toLowerCase().includes("asset")) {
            if (n.balance !== void 0 && n.balance > total) total = n.balance;
          }
          if (n.children) findTotal(n.children);
        }
      };
      findTotal(reportData);
      return total > 0 ? total : 1;
    }, [reportData, isCommonSized]);
    const [expandedNodes, setExpandedNodes] = (0, import_react8.useState)(() => getInitialExpandedNodes(reportData));
    (0, import_react8.useEffect)(() => {
      setExpandedNodes(getInitialExpandedNodes(reportData));
    }, [reportData]);
    const toggleNode = (id) => {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const visibleRows = getVisibleRows(reportData, expandedNodes);
    const isLandscapeMultiPeriod = (isMultiPeriod || isBudgetPeriod) && monthDiff > 3;
    const isLandscapeComparePeriod = isCompareBudgetPeriod && monthDiff > 1;
    const isLandscape = isLandscapeMultiPeriod || isLandscapeComparePeriod || isGraphView;
    const ROWS_PER_PAGE = isLandscape ? 13 : 27;
    const pages = [];
    for (let i = 0; i < visibleRows.length; i += ROWS_PER_PAGE) {
      pages.push(visibleRows.slice(i, i + ROWS_PER_PAGE));
    }
    const [showFindDialog, setShowFindDialog] = (0, import_react8.useState)(false);
    const [findKeyword, setFindKeyword] = (0, import_react8.useState)("");
    const [matchCount, setMatchCount] = (0, import_react8.useState)(0);
    const [currentMatch, setCurrentMatch] = (0, import_react8.useState)(0);
    const getInitialDialogPos = () => ({
      x: typeof window !== "undefined" ? Math.max(0, (window.innerWidth - 340) / 2) : 300,
      y: typeof window !== "undefined" ? Math.max(0, (window.innerHeight - 150) / 2) : 200
    });
    const [dialogPos, setDialogPos] = (0, import_react8.useState)(getInitialDialogPos());
    const [isDragging, setIsDragging] = (0, import_react8.useState)(false);
    const [dragOffset, setDragOffset] = (0, import_react8.useState)({ x: 0, y: 0 });
    const printAreaRef = (0, import_react8.useRef)(null);
    (0, import_react8.useEffect)(() => {
      const handleMouseMove = (e) => {
        if (!isDragging) return;
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 150;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX > maxX) newX = maxX;
        if (newY > maxY) newY = maxY;
        setDialogPos({ x: newX, y: newY });
      };
      const handleMouseUp = () => setIsDragging(false);
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      }
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, dragOffset]);
    (0, import_react8.useEffect)(() => {
      const handleGlobalKeyDown = (e) => {
        if (e.ctrlKey && e.key === "f") {
          e.preventDefault();
          setShowFindDialog(true);
        } else if (e.key === "Escape" && showFindDialog) {
          setShowFindDialog(false);
          if (printAreaRef.current) {
            const marks = printAreaRef.current.querySelectorAll("mark.search-highlight");
            marks.forEach((mark) => {
              const parent = mark.parentNode;
              if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
                parent.normalize();
              }
            });
            setMatchCount(0);
            setCurrentMatch(0);
          }
          setDialogPos(getInitialDialogPos());
        }
      };
      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [showFindDialog]);
    const handlePrint = () => {
      window.print();
    };
    const handleExport = async () => {
      try {
        if ("showSaveFilePicker" in window) {
          const handle = await window.showSaveFilePicker({
            suggestedName: `Laporan_${reportName.replace(/\s+/g, "_")}_${(/* @__PURE__ */ new Date()).getTime()}`,
            types: [
              { description: "Format PDF (.pdf)", accept: { "application/pdf": [".pdf"] } },
              { description: "Format Excel (.xls)", accept: { "application/vnd.ms-excel": [".xls", ".xlsx"] } },
              { description: "Format JSON Raw Data", accept: { "application/json": [".json"] } }
            ]
          });
          const writable = await handle.createWritable();
          const extension = handle.name.split(".").pop()?.toLowerCase();
          try {
            if (extension === "json") {
              await writable.write(JSON.stringify(BALANCE_SHEET_DATA, null, 2));
            } else if (extension === "pdf") {
              const printContent = printAreaRef.current;
              if (printContent) {
                const opt = {
                  margin: [15, 10, 15, 10],
                  // Elegant margins
                  filename: handle.name,
                  image: { type: "jpeg", quality: 0.98 },
                  pagebreak: { mode: ["avoid-all", "css", "legacy"] },
                  html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    scrollY: 0,
                    windowWidth: 794,
                    onclone: (clonedDoc) => {
                      const style = clonedDoc.createElement("style");
                      style.innerHTML = `
                      :root { --default-border-color: transparent !important; }
                      body { color: #000 !important; background-color: #fff !important; }
                      * { border-color: #000; }
                    `;
                      clonedDoc.head.appendChild(style);
                      const elements = clonedDoc.querySelectorAll("*");
                      elements.forEach((el) => {
                        if (el.className && typeof el.className === "string") {
                          el.className = el.className.replace(/\b(bg|text|border|from|to|ring|divide)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g, "");
                          el.className = el.className.replace(/\b(bg|text|border)-(white|black|transparent)\b/g, "");
                        }
                      });
                    }
                  },
                  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
                };
                const html2pdfFn = typeof html2pdfLib === "function" ? html2pdfLib : html2pdfLib.default;
                if (typeof html2pdfFn !== "function") {
                  throw new Error("Library html2pdf gagal dimuat");
                }
                const worker = html2pdfFn().set(opt).from(printContent);
                const pdfBlob = await worker.output("blob");
                if (!pdfBlob || pdfBlob.size === 0) {
                  throw new Error("Render PDF menghasilkan file kosong.");
                }
                await writable.write(pdfBlob);
              }
            } else {
              const htmlStr = `<html><body><h1>RNF ERP Document</h1><p>Export to .${extension} is fully integrated in Backend Engine.</p></body></html>`;
              await writable.write(htmlStr);
            }
          } finally {
            await writable.close();
          }
        } else {
          alert("Sistem O/S atau Browser Anda tidak mendukung Native File System Access API.");
        }
      } catch (err) {
        if (err.name === "AbortError" || err.message?.includes("aborted") || err.message?.includes("user aborted")) {
          console.log("Operasi dibatalkan secara elegan oleh pengguna.");
        } else {
          alert("Ekspor Gagal: " + (err.message || err));
        }
      }
    };
    const handleShare = async () => {
      setIsDropdownOpen(false);
      if (navigator.share) {
        try {
          await navigator.share({
            title: reportName,
            text: "Tinjauan Laporan Keuangan dari RNF ERP Enterprise.",
            url: window.location.href
          });
        } catch (err) {
          console.log("Share dibatalkan pengguna");
        }
      } else {
        const subject = encodeURIComponent(`Laporan: ${reportName}`);
        const body = encodeURIComponent(`Tinjauan Laporan Keuangan dari RNF ERP Enterprise.

Link: ${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    };
    const handleReset = () => {
      setIsDropdownOpen(false);
      setShowGraphView(false);
      setExpandedNodes(getInitialExpandedNodes(BALANCE_SHEET_DATA));
      handleRefresh();
      setToastMessage({
        title: "Dikembalikan ke Standar",
        desc: "Parameter, tata letak, dan filter telah kembali ke setelan pabrik."
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    };
    const clearHighlights = () => {
      if (!printAreaRef.current) return;
      const marks = printAreaRef.current.querySelectorAll("mark.search-highlight");
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
          parent.normalize();
        }
      });
      setMatchCount(0);
      setCurrentMatch(0);
    };
    const executeFind = (direction = "next") => {
      if (!findKeyword.trim()) {
        clearHighlights();
        return;
      }
      clearHighlights();
      const printArea = printAreaRef.current;
      if (!printArea) return;
      const escapedKeyword = findKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedKeyword})`, "gi");
      let count = 0;
      const walk = document.createTreeWalker(printArea, NodeFilter.SHOW_TEXT, null);
      const nodesToReplace = [];
      let node;
      while (node = walk.nextNode()) {
        if (node.nodeValue && regex.test(node.nodeValue)) {
          if (node.parentElement && !["SCRIPT", "STYLE"].includes(node.parentElement.tagName)) {
            nodesToReplace.push({ node, text: node.nodeValue });
          }
        }
      }
      nodesToReplace.forEach(({ node: node2, text }) => {
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        text.replace(regex, (match, p1, offset) => {
          if (offset > lastIdx) {
            frag.appendChild(document.createTextNode(text.slice(lastIdx, offset)));
          }
          const mark = document.createElement("mark");
          mark.className = "search-highlight bg-yellow-200 text-slate-900 rounded-[2px] shadow-sm transition-all duration-300";
          mark.dataset.index = String(count++);
          mark.textContent = match;
          frag.appendChild(mark);
          lastIdx = offset + match.length;
          return match;
        });
        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx)));
        }
        if (node2.parentNode) {
          node2.parentNode.replaceChild(frag, node2);
        }
      });
      setMatchCount(count);
      if (count > 0) {
        let targetIndex = currentMatch;
        if (direction === "next") {
          targetIndex = currentMatch + 1 > count ? 1 : currentMatch + 1;
        } else if (direction === "prev") {
          targetIndex = currentMatch - 1 < 1 ? count : currentMatch - 1;
        } else if (direction === "first") {
          targetIndex = 1;
        } else {
          targetIndex = 1;
        }
        setCurrentMatch(targetIndex);
        const targetMark = printArea.querySelector(`mark[data-index="${targetIndex - 1}"]`);
        if (targetMark) {
          targetMark.scrollIntoView({ behavior: "smooth", block: "center" });
          document.querySelectorAll("mark.search-highlight").forEach((m) => {
            m.classList.remove("ring-2", "ring-blue-500", "bg-blue-200", "scale-110");
            m.classList.add("bg-yellow-200");
          });
          targetMark.classList.remove("bg-yellow-200");
          targetMark.classList.add("bg-blue-200", "ring-2", "ring-blue-500", "scale-110", "z-10", "relative");
        }
      } else {
        setCurrentMatch(0);
      }
    };
    (0, import_react8.useEffect)(() => {
      if (showFindDialog) {
        const timer = setTimeout(() => {
          executeFind("first");
        }, 250);
        return () => clearTimeout(timer);
      }
    }, [findKeyword, showFindDialog]);
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - dialogPos.x,
        y: e.clientY - dialogPos.y
      });
    };
    const handleFindText = () => {
      if (showFindDialog) {
        clearHighlights();
        setShowFindDialog(false);
        setDialogPos(getInitialDialogPos());
      } else {
        setShowFindDialog(true);
      }
    };
    const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    };
    return /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col h-full w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md animate-in fade-in duration-300 print:shadow-none print:border-none" }, /* @__PURE__ */ import_react8.default.createElement("style", { type: "text/css", media: "print" }, `
          @page { size: A4 ${isLandscape ? "landscape" : "portrait"} !important; margin: 0 !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .print-graph-scale {
            transform: scale(0.85);
            transform-origin: top center;
            width: 115% !important;
            margin-left: -7.5% !important;
          }
        `), showFindDialog && /* @__PURE__ */ import_react8.default.createElement(
      "div",
      {
        className: "fixed bg-white border border-slate-200 shadow-2xl rounded-lg z-[100] flex flex-col font-sans select-none print:hidden overflow-hidden",
        style: { left: dialogPos.x, top: dialogPos.y, width: 340 }
      },
      /* @__PURE__ */ import_react8.default.createElement(
        "div",
        {
          className: "bg-slate-50 px-3 py-2 flex justify-between items-center cursor-move border-b border-slate-200",
          onMouseDown: handleMouseDown
        },
        /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Search, { className: "w-4 h-4 text-slate-500", strokeWidth: 2 }), /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[12px] font-bold text-slate-700 tracking-wide uppercase" }, "Cari di Dokumen")),
        /* @__PURE__ */ import_react8.default.createElement(
          "button",
          {
            onClick: () => {
              setShowFindDialog(false);
              clearHighlights();
              setDialogPos(getInitialDialogPos());
            },
            className: "text-slate-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors",
            title: "Tutup (Esc)"
          },
          /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.X, { className: "w-4 h-4" })
        )
      ),
      /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-3 flex flex-col gap-3 bg-white" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center relative" }, /* @__PURE__ */ import_react8.default.createElement(
        "input",
        {
          type: "text",
          autoFocus: true,
          placeholder: "Masukkan teks untuk dicari...",
          className: "w-full border border-slate-300 pl-3 pr-8 py-1.5 text-[13px] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400",
          value: findKeyword,
          onChange: (e) => {
            setFindKeyword(e.target.value);
            if (!e.target.value) clearHighlights();
          },
          onKeyDown: (e) => {
            if (e.key === "Enter") executeFind(e.shiftKey ? "prev" : "next");
          }
        }
      ), findKeyword && /* @__PURE__ */ import_react8.default.createElement(
        "button",
        {
          onClick: () => {
            setFindKeyword("");
            clearHighlights();
          },
          className: "absolute right-2 text-slate-400 hover:text-slate-600"
        },
        /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.X, { className: "w-3.5 h-3.5" })
      )), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[11.5px] font-medium text-slate-500" }, matchCount > 0 ? /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-blue-600 font-semibold" }, currentMatch, " dari ", matchCount, " hasil") : findKeyword && matchCount === 0 ? /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-red-500" }, "Tidak ada hasil ditemukan") : /* @__PURE__ */ import_react8.default.createElement("span", null, "Siap untuk mencari")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex gap-1" }, /* @__PURE__ */ import_react8.default.createElement(
        "button",
        {
          onClick: () => executeFind("prev"),
          disabled: !findKeyword || matchCount === 0,
          className: "p-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
          title: "Hasil sebelumnya (Shift+Enter)"
        },
        /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.ChevronUp, { className: "w-4 h-4" })
      ), /* @__PURE__ */ import_react8.default.createElement(
        "button",
        {
          onClick: () => executeFind("next"),
          disabled: !findKeyword,
          className: "p-1.5 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
          title: "Hasil berikutnya (Enter)"
        },
        /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.ChevronDown, { className: "w-4 h-4" })
      ))))
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center justify-between p-1.5 bg-white border-b border-slate-200 shrink-0 print:hidden relative z-10 shadow-sm" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center flex-1 min-w-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-1 overflow-x-auto no-scrollbar" }, !(isGraphView || showGraphView) && /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: () => setShowAdvancedSelection(true),
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.SlidersHorizontal, { className: "w-4 h-4 text-blue-600", strokeWidth: 2 }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Modifikasi")
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-px h-5 bg-slate-200 mx-1 shrink-0" })), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: handlePrint,
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Printer, { className: "w-4 h-4 text-slate-600", strokeWidth: 2 }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Cetak")
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: handleExport,
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Save, { className: "w-4 h-4 text-slate-600", strokeWidth: 2 }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Simpan")
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-px h-5 bg-slate-200 mx-1 shrink-0" }), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: () => setShowMemorizeModal(true),
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Bookmark, { className: "w-4 h-4 text-pink-600", strokeWidth: 2 }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Simpan Format")
    ), /* @__PURE__ */ import_react8.default.createElement("button", { onClick: handleRefresh, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.RefreshCw, { className: `w-4 h-4 text-sky-600 ${isRefreshing ? "animate-spin" : ""}`, strokeWidth: 2 }), /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Perbarui")), !(isGraphView || showGraphView) && /* @__PURE__ */ import_react8.default.createElement("button", { onClick: handleFindText, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors shrink-0" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Search, { className: "w-4 h-4 text-slate-500", strokeWidth: 2 }), /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Cari Teks"))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-1 pl-1 shrink-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-px h-5 bg-slate-200 mx-1 shrink-0" }), /* @__PURE__ */ import_react8.default.createElement("div", { className: "relative shrink-0" }, /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: () => setIsDropdownOpen(!isDropdownOpen),
        className: `flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${isDropdownOpen ? "bg-slate-100 text-slate-800" : "hover:bg-slate-100 text-slate-700"}`
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Settings, { className: "w-4 h-4 text-slate-500", strokeWidth: 2 }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Aksi Lainnya"),
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.ChevronDown, { className: `w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}` })
    ), isDropdownOpen && /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement(
      "div",
      {
        className: "fixed inset-0 z-40",
        onClick: () => setIsDropdownOpen(false)
      }
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-1 flex flex-col" }, !isGraphView && /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: `flex items-center gap-2 px-3 py-2 rounded transition-colors text-left w-full ${showGraphView ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"}`,
        onClick: () => {
          setIsDropdownOpen(false);
          setShowGraphView(!showGraphView);
        }
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.BarChart2, { className: `w-4 h-4 shrink-0 ${showGraphView ? "text-blue-600" : "text-purple-600"}` }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, showGraphView ? "Tampilan Tabel" : "Tampilan Grafik")
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full",
        onClick: () => {
          setIsDropdownOpen(false);
          setShowPresetModal(true);
        }
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Bookmark, { className: "w-4 h-4 text-pink-600 shrink-0" }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Muat Format")
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full",
        onClick: handleShare
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Share2, { className: "w-4 h-4 text-sky-500 shrink-0" }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Bagikan Laporan")
    ), !(isGraphView || showGraphView) && /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "h-px w-full bg-slate-100 my-1" }), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full",
        onClick: () => {
          setIsDropdownOpen(false);
          setActiveFeatureModal({ title: "Pengaturan Tata Letak", icon: import_lucide_react7.Layout });
        }
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Layout, { className: "w-4 h-4 text-slate-500 shrink-0" }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Pengaturan Tata Letak")
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition-colors text-left w-full",
        onClick: () => {
          setIsDropdownOpen(false);
          setActiveFeatureModal({ title: "Manajemen Kolom Kustom", icon: import_lucide_react7.Columns });
        }
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Columns, { className: "w-4 h-4 text-slate-500 shrink-0" }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Kelola Kolom")
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        className: "flex items-center gap-2 px-3 py-2 rounded hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors text-left w-full",
        onClick: handleReset
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.RotateCcw, { className: "w-4 h-4 text-rose-500 shrink-0" }),
      /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-[12px]" }, "Kembalikan ke Standar")
    ))))))))), showAdvancedSelection && /* @__PURE__ */ import_react8.default.createElement(
      AdvancedSelectionModal,
      {
        report: { id: "bs_standard", name: reportName, categoryId: "fin", type: "STANDARD" },
        onClose: () => setShowAdvancedSelection(false),
        onExecute: (params, outputType) => {
          setShowAdvancedSelection(false);
          handleRefresh();
        }
      }
    ), showMemorizeModal && /* @__PURE__ */ import_react8.default.createElement(
      MemorizeReportModal,
      {
        currentReportName: reportName,
        onClose: () => setShowMemorizeModal(false),
        onSave: (name, title) => {
          setShowMemorizeModal(false);
          const currentConfig = {
            chartType,
            measure,
            dimension,
            splitBy,
            compareMode,
            activeCategories
          };
          let presets = [];
          const saved = localStorage.getItem("rnf_report_presets");
          if (saved) {
            try {
              presets = JSON.parse(saved);
            } catch (e) {
            }
          }
          const date = /* @__PURE__ */ new Date();
          const formatDateTime = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
          const newPreset = {
            id: Date.now().toString(),
            name,
            title,
            lastModified: formatDateTime,
            config: currentConfig
          };
          const existingIndex = presets.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
          if (existingIndex >= 0) {
            newPreset.id = presets[existingIndex].id;
            presets[existingIndex] = newPreset;
          } else {
            presets.push(newPreset);
          }
          localStorage.setItem("rnf_report_presets", JSON.stringify(presets));
          setToastMessage({
            title: "Format Berhasil Disimpan",
            desc: `Format "${name}" telah diamankan secara lokal di browser Anda.`
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4e3);
        }
      }
    ), activeFeatureModal && /* @__PURE__ */ import_react8.default.createElement("div", { className: "fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 animate-in fade-in duration-200" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-white border border-slate-200 rounded-xl shadow-2xl w-[450px] p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-16 h-16 bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 ring-4 ring-blue-50" }, import_react8.default.createElement(activeFeatureModal.icon, { className: "w-8 h-8 text-blue-600 animate-pulse" })), /* @__PURE__ */ import_react8.default.createElement("h3", { className: "text-[20px] font-bold text-slate-800 mb-2 tracking-tight" }, activeFeatureModal.title), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-[14px] text-slate-500 mb-8 leading-relaxed max-w-[320px]" }, "Modul fungsionalitas kustomisasi tingkat lanjut ini sedang dikembangkan oleh Tim RNF Enterprise untuk pembaruan mayor berikutnya."), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: () => setActiveFeatureModal(null),
        className: "w-full px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-[14px]"
      },
      "Kembali ke Laporan"
    ))), showPresetModal && /* @__PURE__ */ import_react8.default.createElement(
      LoadPresetModal,
      {
        onClose: () => setShowPresetModal(false),
        onLoad: (config) => {
          if (config.chartType) setChartType(config.chartType);
          if (config.measure) setMeasure(config.measure);
          if (config.dimension) setDimension(config.dimension);
          if (config.splitBy) setSplitBy(config.splitBy);
          if (config.compareMode) setCompareMode(config.compareMode);
          if (config.activeCategories) setActiveCategories(config.activeCategories);
          setShowPresetModal(false);
          setToastMessage({
            title: "Preset Berhasil Dimuat",
            desc: "Konfigurasi grafik telah diperbarui berdasarkan preset."
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3e3);
        }
      }
    ), showToast && /* @__PURE__ */ import_react8.default.createElement("div", { className: "fixed bottom-8 right-8 bg-white border border-slate-200 px-5 py-4 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-[200] flex items-start gap-3 animate-in slide-in-from-bottom-8 fade-in duration-300" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.CheckCircle2, { className: "w-5 h-5 text-emerald-500 mt-0.5", strokeWidth: 2.5 }), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col font-sans" }, /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[14px] font-bold text-slate-800 tracking-tight" }, toastMessage.title), /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[12px] text-slate-500 mt-0.5 max-w-[250px] leading-snug" }, toastMessage.desc))), /* @__PURE__ */ import_react8.default.createElement("div", { className: `flex-1 overflow-auto print:bg-white print:overflow-visible print:block flex flex-col items-center print:p-0 print:gap-0 relative custom-scrollbar ${isGraphView ? "bg-white" : "bg-slate-100 p-4 pt-3 gap-4"}` }, isGraphView ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-full mx-auto animate-in fade-in duration-500 flex flex-col justify-center items-start relative print:h-[210mm] print:max-h-[210mm] print:overflow-hidden" }, reportName.toLowerCase().includes("income and expense") ? /* @__PURE__ */ import_react8.default.createElement(IncomeExpenseDashboard, null) : /* @__PURE__ */ import_react8.default.createElement(EnterpriseFinancialChart, { reportName, reportParams }), /* @__PURE__ */ import_react8.default.createElement("div", { className: "hidden print:flex justify-between border-t border-black pt-2 pb-1 text-[10px] text-slate-500 fixed bottom-[12mm] left-[12mm] right-[12mm] z-50" }, /* @__PURE__ */ import_react8.default.createElement("span", null, "Page 1/1"), /* @__PURE__ */ import_react8.default.createElement("span", null, "Printed by RNF Enterprise System Report"))) : showGraphView ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-full max-w-[1000px] mx-auto bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col items-center justify-center animate-in fade-in duration-500 p-12 text-center" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.BarChart2, { className: "w-32 h-32 text-slate-100", strokeWidth: 1 }), /* @__PURE__ */ import_react8.default.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-white to-transparent" })), /* @__PURE__ */ import_react8.default.createElement("h2", { className: "text-[24px] font-bold text-slate-800 mt-4 tracking-tight" }, "Enterprise Visual Analytics"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-[14px] text-slate-500 mt-2 max-w-[450px] leading-relaxed mb-8" }, "Modul Intelijen Bisnis (Business Intelligence) untuk visualisasi grafis laporan keuangan sedang dioptimalkan. Analisis ", /* @__PURE__ */ import_react8.default.createElement("i", null, "real-time"), " menggunakan pustaka rendering GPU akan segera tersedia."), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        onClick: () => setShowGraphView(false),
        className: "px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-[13px] shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react7.Layout, { className: "w-4 h-4" }),
      " Kembali ke Tampilan Kertas"
    )) : pages.map((pageRows, pageIndex) => /* @__PURE__ */ import_react8.default.createElement("div", { key: `page-${pageIndex}`, ref: pageIndex === 0 ? printAreaRef : null, className: `a4-paper ${isLandscape ? "w-[297mm] min-h-[210mm] print:w-[297mm] print:min-h-[190mm] print:h-[190mm]" : "w-[210mm] min-h-[297mm] print:w-[210mm] print:min-h-[275mm] print:h-[275mm]"} print:m-0 shadow-[0_8px_30px_rgb(0,0,0,0.12)] print:shadow-none print:border-none rounded-sm border p-[12mm] flex flex-col shrink-0 overflow-visible print:overflow-hidden box-border bg-white border-slate-200 relative ${pageIndex < pages.length - 1 ? "print:break-after-page" : "print:break-inside-avoid"}` }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "relative mb-8 text-black font-sans shrink-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "absolute top-0 left-0 w-20 h-20 flex items-start justify-start" }, /* @__PURE__ */ import_react8.default.createElement("img", { src: "/rnflogokop.jpg", alt: "Logo RNF", className: "w-full h-full object-contain" })), /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-center pt-1" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[15px] font-bold" }, "PT. Rezeki Nadh Fathan"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[22px] font-bold mt-1 leading-tight text-[#e40505]" }, reportName), isProfitAndLoss || isRetainedEarning || isFinancialHighlight || isCashFlowDetail || isCashFlowSummary ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[14px] font-bold mt-1" }, isRetainedEarning || isFinancialHighlight ? `Period Year ${reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear()}` : isCompareMonth ? "Comparative Analysis" : isCashFlowDetail || isCashFlowSummary ? `Period ${reportParams?.periodFrom ? new Date(reportParams.periodFrom).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "August 2011"} to ${reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "October 2011"}` : `For the Period Ended ${reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "29 Juni " + (/* @__PURE__ */ new Date()).getFullYear()}`), isCompareMonth ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[12px] mt-0.5" }, "[Period 1]: ", reportParams?.comparePeriodFrom ? new Date(reportParams.comparePeriodFrom).toLocaleDateString("en-GB") : "01/05/" + (/* @__PURE__ */ new Date()).getFullYear(), " to ", reportParams?.comparePeriodTo ? new Date(reportParams.comparePeriodTo).toLocaleDateString("en-GB") : "31/05/" + (/* @__PURE__ */ new Date()).getFullYear(), " ", /* @__PURE__ */ import_react8.default.createElement("br", null), "[Period 2]: ", reportParams?.periodFrom ? new Date(reportParams.periodFrom).toLocaleDateString("en-GB") : "01/06/" + (/* @__PURE__ */ new Date()).getFullYear(), " to ", reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("en-GB") : "30/06/" + (/* @__PURE__ */ new Date()).getFullYear()) : !(isRetainedEarning || isFinancialHighlight || isCashFlowDetail || isCashFlowSummary) && reportParams?.periodFrom && /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[12px] font-bold mt-0.5" }, "Period ", new Date(reportParams.periodFrom).toLocaleDateString("en-GB", { month: "long", year: "numeric" }), " to ", reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "29/06/" + (/* @__PURE__ */ new Date()).getFullYear())) : /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[14px] font-bold mt-1" }, isCompareMonth ? "Comparative Analysis" : `As of ${reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "17 Juni " + (/* @__PURE__ */ new Date()).getFullYear()}`), isCompareMonth ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[12px] mt-0.5" }, "[Period 1]: ", reportParams?.comparePeriodTo ? new Date(reportParams.comparePeriodTo).toLocaleDateString("en-GB") : "31/05/" + (/* @__PURE__ */ new Date()).getFullYear(), " ", /* @__PURE__ */ import_react8.default.createElement("br", null), "[Period 2]: ", reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("en-GB") : "30/06/" + (/* @__PURE__ */ new Date()).getFullYear()) : reportParams?.periodFrom && /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[12px] mt-0.5" }, "Period: ", new Date(reportParams.periodFrom).toLocaleDateString("en-GB"), " to ", reportParams?.periodTo ? new Date(reportParams.periodTo).toLocaleDateString("en-GB") : "29/06/" + (/* @__PURE__ */ new Date()).getFullYear())))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-full mt-6 flex-1 flex flex-col pb-8" }, isGraphView ? reportName.toLowerCase().includes("income and expense") ? /* @__PURE__ */ import_react8.default.createElement(IncomeExpenseDashboard, null) : /* @__PURE__ */ import_react8.default.createElement(EnterpriseFinancialChart, { reportName, reportParams }) : /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex text-[12px] font-bold text-black border-y border-black py-1 mb-2 shrink-0" }, isCashFlowDetail ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-64 text-center px-1" }, "Account No."), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 text-center px-1" }, "Account No. Name")) : isCashFlowSummary ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-48 text-center px-1" }, "Status"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 text-center px-1" }, "Account Type")) : /* @__PURE__ */ import_react8.default.createElement("div", { className: `${isLandscape ? "w-[220px] shrink-0" : "flex-1 min-w-[200px]"} text-center` }, "Description"), isCompareBudgetPeriod ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, multiPeriodHeaders.map((header, idx) => /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, { key: idx }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 min-w-[65px] text-center px-1" }, "Act ", header), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 min-w-[65px] text-center px-1" }, "Bud ", header))), monthDiff > 1 && /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 min-w-[65px] text-center font-extrabold px-1" }, "Total Actual"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 min-w-[65px] text-center font-extrabold px-1" }, "Total Budget"))) : isConsolidation ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-40 text-center" }, "PT. Rezeki Nadh Fathan"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-40 text-center" }, "Total")) : isCommonSized ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Balance"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-24 text-center" }, "% of Asset")) : isCompareBudget ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Actual"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Budget"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Variance"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-24 text-center" }, "Variance %")) : isCompareMonth ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Period 1"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Period 2"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center" }, "Variance"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-24 text-center" }, "Variance %")) : isBudgetPeriod ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, multiPeriodHeaders.map((header, idx) => /* @__PURE__ */ import_react8.default.createElement("div", { key: idx, className: "flex-1 min-w-[70px] text-center px-1" }, "Bud ", header)), monthDiff > 1 && /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 min-w-[70px] text-center font-extrabold px-1" }, "Total")) : isMultiPeriod ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, multiPeriodHeaders.map((header, idx) => /* @__PURE__ */ import_react8.default.createElement("div", { key: idx, className: "flex-1 min-w-[70px] text-center px-1" }, header)), monthDiff > 1 && /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 min-w-[70px] text-center font-extrabold px-1" }, "Total")) : isFinancialHighlight ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center px-1" }, reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear()), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center px-1" }, (reportParams?.periodTo ? new Date(reportParams.periodTo).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear()) - 1), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center px-1" }, "Increase(%)")) : isRetainedEarning || isOwnerEquity ? /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-32 text-center px-1" }, "Balance"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-24 text-center px-1" }, "Total Data")) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-40 text-center px-1" }, "Balance")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "w-full flex flex-col font-sans" }, pageRows.map((flat, idx) => /* @__PURE__ */ import_react8.default.createElement(
      ReportRowItemFlat,
      {
        key: flat.node.id + "-" + idx,
        flatNode: flat,
        isExpanded: expandedNodes.has(flat.node.id),
        onToggle: () => toggleNode(flat.node.id),
        isMultiPeriod,
        isCompareMonth,
        isBudgetPeriod,
        isCompareBudget,
        isCompareBudgetPeriod,
        isConsolidation,
        isCommonSized,
        isRetainedEarning: isRetainedEarning || isOwnerEquity,
        isFinancialHighlight,
        isCashFlowDetail,
        totalAssets,
        isLandscape
      }
    ))))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex justify-between border-t border-black pt-2 pb-1 mt-auto text-[10px] text-slate-500 shrink-0 w-full" }, /* @__PURE__ */ import_react8.default.createElement("span", null, "Page ", pageIndex + 1, "/", pages.length), /* @__PURE__ */ import_react8.default.createElement("span", null, "Printed by RNF Enterprise System Report"))))));
  };
})();
