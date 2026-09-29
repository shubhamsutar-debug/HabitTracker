import { useRef, useState } from 'react'
import {
  Sun, Moon, Monitor, Download, Upload, FileText,
  Trash2, ChevronRight, Bell, BellOff, Send,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useSettings } from '../../hooks/useSettings'
import { useNotifications } from '../../hooks/useNotifications'
import { Header } from '../../components/Header'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { restoreHabits } from '../../db/habits'
import { restoreLogs } from '../../db/logs'
import { restoreSettings, clearAllData } from '../../db/settings'
import { exportBackupJSON, exportCSV, parseBackup, readFileAsText } from '../../utils/export'
import type { Theme } from '../../types'

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark',  label: 'Dark',  icon: Moon },
  { value: 'system',label: 'System',icon: Monitor },
]

/* ── small reusable row ── */
function SettingsRow({
  icon,
  iconBg,
  label,
  sub,
  onClick,
  destructive = false,
  disabled = false,
  right,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  sub?: string
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  right?: React.ReactNode
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, disabled } : {})}
      className={[
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
        onClick && !destructive ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50' : '',
        onClick && destructive ? 'hover:bg-red-50 dark:hover:bg-red-950/20' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${destructive ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={16} className="text-slate-400 flex-shrink-0" aria-hidden="true" />)}
    </Tag>
  )
}

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { settings, update: updateSettings } = useSettings()
  const notifications = useNotifications(settings?.notificationsEnabled ?? false)

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importError, setImportError]   = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── data handlers ── */
  const handleExportJSON = async () => {
    try { await exportBackupJSON() }
    catch (e) { alert(e instanceof Error ? e.message : 'Export failed.') }
  }

  const handleExportCSV = async () => {
    try { await exportCSV() }
    catch (e) { alert(e instanceof Error ? e.message : 'Export failed.') }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    setImportSuccess(false)
    setBusy(true)
    try {
      const text = await readFileAsText(file)
      const backup = parseBackup(text)
      await restoreHabits(backup.habits)
      await restoreLogs(backup.habitLogs)
      if (backup.settings) await restoreSettings(backup.settings)
      setImportSuccess(true)
      setTimeout(() => { window.location.reload() }, 1500)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClearAll = async () => {
    await clearAllData()
    setShowClearConfirm(false)
    window.location.reload()
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Settings" />

      <div className="flex-1 px-4 pt-5 pb-nav max-w-2xl mx-auto w-full space-y-6">

        {/* ── Appearance ── */}
        <section>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Appearance
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {/* Theme */}
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => void setTheme(value)}
                    aria-pressed={theme === value}
                    className={[
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      theme === value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500',
                    ].join(' ')}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Week start */}
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Week starts on</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Affects history grid</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
                {([{ label: 'Mon', val: 1 }, { label: 'Sun', val: 0 }] as const).map(({ label, val }) => (
                  <button
                    key={val}
                    onClick={() => void updateSettings({ weekStartsOn: val })}
                    aria-pressed={settings?.weekStartsOn === val}
                    className={[
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      settings?.weekStartsOn === val
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Reminders
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {!notifications.supported ? (
              <div className="px-4 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <BellOff size={16} className="text-slate-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Not supported</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your browser doesn't support push notifications.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Toggle row */}
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                    <Bell size={16} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Daily reminder</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {notifications.permission === 'denied'
                        ? 'Blocked in browser settings'
                        : notifications.permission === 'default'
                        ? 'Tap to enable notifications'
                        : 'Remind you to check your habits'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.enabled}
                    disabled={notifications.permission === 'denied'}
                    onClick={() => void notifications.toggle(!notifications.enabled)}
                    className={[
                      'relative inline-flex w-12 h-6 rounded-full transition-colors flex-shrink-0',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                      notifications.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600',
                      notifications.permission === 'denied' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                        notifications.enabled ? 'translate-x-6' : 'translate-x-0',
                      ].join(' ')}
                    />
                  </button>
                </div>

                {/* Test notification */}
                {notifications.enabled && notifications.permission === 'granted' && (
                  <SettingsRow
                    icon={<Send size={16} className="text-purple-600 dark:text-purple-400" aria-hidden="true" />}
                    iconBg="bg-purple-100 dark:bg-purple-900/40"
                    label="Send test notification"
                    sub="Preview how reminders look"
                    onClick={notifications.sendTestNotification}
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* ── Data management ── */}
        <section>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            Data Management
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            <SettingsRow
              icon={<Download size={16} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
              iconBg="bg-indigo-100 dark:bg-indigo-900/40"
              label="Export Backup"
              sub="Save all habits & logs as JSON"
              onClick={() => void handleExportJSON()}
            />
            <SettingsRow
              icon={<Upload size={16} className="text-green-600 dark:text-green-400" aria-hidden="true" />}
              iconBg="bg-green-100 dark:bg-green-900/40"
              label={busy ? 'Importing…' : 'Import Backup'}
              sub="Restore from a JSON backup file"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            />
            <SettingsRow
              icon={<FileText size={16} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />}
              iconBg="bg-amber-100 dark:bg-amber-900/40"
              label="Export CSV"
              sub="Spreadsheet-compatible export"
              onClick={() => void handleExportCSV()}
            />
            <SettingsRow
              icon={<Trash2 size={16} className="text-red-600 dark:text-red-400" aria-hidden="true" />}
              iconBg="bg-red-100 dark:bg-red-900/40"
              label="Clear All Data"
              sub="Delete all habits and logs"
              onClick={() => setShowClearConfirm(true)}
              destructive
            />
          </div>

          {importError && (
            <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400 px-1">
              ⚠️ {importError}
            </p>
          )}
          {importSuccess && (
            <p role="status" className="mt-2 text-sm text-green-600 dark:text-green-400 px-1">
              ✓ Backup imported. Reloading…
            </p>
          )}
        </section>

        {/* ── About ── */}
        <section>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
            About
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">H</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">HabitTrack</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All data lives on your device. No account, no cloud, no tracking.
              Works fully offline after installation.
            </p>
          </div>
        </section>

        {/* bottom breathing room */}
        <div className="h-2" />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={(e) => void handleImport(e)}
        className="sr-only"
        aria-label="Import backup file"
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Data"
        message="This will permanently delete all your habits, logs, and settings. This cannot be undone."
        confirmLabel="Clear Everything"
        destructive
        onConfirm={() => void handleClearAll()}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
