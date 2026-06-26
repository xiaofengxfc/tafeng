import { Activity, ChevronDown, ChevronRight, Clock3, FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppSettings, Language, ProcessInfo, ServerMetrics, ServerProfile } from "../shared/types";
import { CommandHistoryPanel } from "./components/CommandHistoryPanel";
import { ConnectionPanel } from "./components/ConnectionPanel";
import { FileEditor } from "./components/FileEditor";
import { LoginGate } from "./components/LoginGate";
import { MonitorPanel } from "./components/MonitorPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { TerminalPane } from "./components/TerminalPane";
import { api } from "./lib/api";
import { createT } from "./lib/i18n";

const fallbackSettings: AppSettings = {
  managementPasswordSet: true,
  twoFactorEnabled: false,
  theme: "dark",
  language: "zh"
};

export default function App() {
  const [loginLanguage, setLoginLanguage] = useState<Language>("zh");
  const [authenticated, setAuthenticated] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(fallbackSettings);
  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [metrics, setMetrics] = useState<ServerMetrics>();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [sshSocket, setSshSocket] = useState<WebSocket | null>(null);
  const sessionLogRef = useRef<string[]>([]);
  const [panelsOpen, setPanelsOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api
      .authState()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    Promise.all([api.settings(), api.connections()])
      .then(([nextSettings, nextProfiles]) => {
        setSettings(nextSettings);
        setProfiles(nextProfiles);
        setSelectedId(nextProfiles[0]?.id);
      })
      .catch((error: Error) => setNotice(error.message));
  }, [authenticated]);

  const selectedProfile = useMemo(() => profiles.find((profile) => profile.id === selectedId), [profiles, selectedId]);
  const t = useMemo(() => createT(settings.language), [settings.language]);

  const handleMetrics = useCallback((nextMetrics: ServerMetrics, nextProcesses: ProcessInfo[]) => {
    setMetrics(nextMetrics);
    setProcesses(nextProcesses);
  }, []);

  const handleCommandSubmitted = useCallback(() => {
    setHistoryRefreshKey((key) => key + 1);
  }, []);

  const handleSocketChange = useCallback((socket: WebSocket | null) => {
    setSshSocket(socket);
    if (!socket) sessionLogRef.current = [];
  }, []);

  const handleTerminalOutput = useCallback((data: string) => {
    sessionLogRef.current.push(data);
  }, []);

  function handleDownloadSessionLog() {
    const text = sessionLogRef.current.join("");
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ssh-session-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function connectProfile(id: string) {
    setSelectedId(id);
    setConnectionAttempt((attempt) => attempt + 1);
  }

  function disconnectProfile(id: string) {
    if (selectedId !== id) return;
    setSelectedId(undefined);
    setMetrics(undefined);
    setProcesses([]);
    setConnectionAttempt((attempt) => attempt + 1);
  }

  async function createConnection(profile: Omit<ServerProfile, "id" | "createdAt" | "updatedAt">) {
    const created = await api.createConnection(profile);
    setProfiles((current) => [created, ...current]);
    connectProfile(created.id);
  }

  async function updateConnection(profile: ServerProfile) {
    const updated = await api.updateConnection(profile);
    setProfiles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    connectProfile(updated.id);
  }

  async function deleteConnection(id: string) {
    await api.deleteConnection(id);
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    if (selectedId === id) setSelectedId(undefined);
  }

  async function saveSettings(nextSettings: AppSettings) {
    setSettings(nextSettings);
    await api.saveSettings(nextSettings);
  }

  async function logout() {
    await api.logout();
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <LoginGate
        language={loginLanguage}
        onLanguageChange={setLoginLanguage}
        onAuthenticated={() => setAuthenticated(true)}
        t={createT(loginLanguage)}
      />
    );
  }

  return (
    <div className={`app-shell ${settings.theme}`}>
      <header className="app-header">
        <div>
          <strong>{t("appName")}</strong>
          <span>{t("productName")}</span>
        </div>
        <SettingsPanel settings={settings} onChange={saveSettings} onLogout={logout} t={t} />
      </header>
      {notice ? <div className="notice">{notice}</div> : null}
      <main className="workspace">
        <ConnectionPanel
          profiles={profiles}
          selectedId={selectedId}
          onSelect={connectProfile}
          onDisconnect={disconnectProfile}
          onCreate={createConnection}
          onUpdate={updateConnection}
          onDelete={deleteConnection}
          t={t}
        />
        <div className="center-stack">
          <div className="context-line">
            <button
              type="button"
              className="log-download-btn"
              onClick={handleDownloadSessionLog}
              title={t("downloadSessionLog")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              下载日志
            </button>
            <span>{selectedProfile ? `${selectedProfile.username}@${selectedProfile.host}` : t("noConnection")}</span>
            <small>{selectedProfile ? `${t("port")} ${selectedProfile.port}` : t("selectConnectionHint")}</small>
          </div>
          <TerminalPane
            profileId={selectedId}
            connectionAttempt={connectionAttempt}
            language={settings.language}
            connectingLabel={t("connecting")}
            disconnectedLabel={t("disconnected")}
            onMetrics={handleMetrics}
            onCommandSubmitted={handleCommandSubmitted}
            onSocketChange={handleSocketChange}
            onOutput={handleTerminalOutput}
          />
          <div className="mobile-panel">
            <button className="mobile-panel-toggle" type="button" onClick={() => setPanelsOpen(p => ({ ...p, files: !p.files }))}>
              <FileText size={16} />
              <span>{t("fileManager")}</span>
              {panelsOpen.files ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className={`mobile-panel-content ${panelsOpen.files ? "open" : ""}`}>
              <FileEditor socket={sshSocket} t={t} />
            </div>
          </div>
          <div className="mobile-panel">
            <button className="mobile-panel-toggle" type="button" onClick={() => setPanelsOpen(p => ({ ...p, history: !p.history }))}>
              <Clock3 size={16} />
              <span>{t("commandHistory")}</span>
              {panelsOpen.history ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className={`mobile-panel-content ${panelsOpen.history ? "open" : ""}`}>
              <CommandHistoryPanel refreshKey={historyRefreshKey} t={t} />
            </div>
          </div>
          <div className="mobile-panel monitor-mobile">
            <button className="mobile-panel-toggle" type="button" onClick={() => setPanelsOpen(p => ({ ...p, monitor: !p.monitor }))}>
              <Activity size={16} />
              <span>{t("liveStatus")}</span>
              {panelsOpen.monitor ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className={`mobile-panel-content ${panelsOpen.monitor ? "open" : ""}`}>
              <MonitorPanel metrics={metrics} processes={processes} t={t} />
            </div>
          </div>
        </div>
        <div className="monitor-desktop">
          <MonitorPanel metrics={metrics} processes={processes} t={t} />
        </div>
      </main>
    </div>
  );
}
