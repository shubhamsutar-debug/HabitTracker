import { useRef, useState } from 'react'
import { Sun, Moon, Monitor, Download, Upload, FileText, Trash2, Bell, BellOff, Send, ChevronRight, Zap } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useSettings } from '../../hooks/useSettings'
import { useNotifications } from '../../hooks/useNotifications'
import { Header } from '../../components/Header'
import { Logo } from '../../components/Logo'
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

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 4px' }}>
      {children}
    </p>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      {children}
    </div>
  )
}

function SettingsRow({ icon, iconBg, label, sub, onClick, danger, disabled, right }: {
  icon: React.ReactNode; iconBg: string; label: string; sub?: string
  onClick?: () => void; danger?: boolean; disabled?: boolean; right?: React.ReactNode
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, disabled } : {})}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', textAlign: 'left',
        background: 'transparent', border: 'none',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        fontFamily: 'inherit', opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (onClick && !disabled) (e.currentTarget as HTMLElement).style.background = 'var(--c-bg)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: danger ? '#DC2626' : 'var(--c-text)', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>{sub}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={15} color="var(--c-border)" aria-hidden="true" />)}
    </Tag>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--c-border)', margin: '0 16px' }} />
}

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { settings, update } = useSettings()
  const notifications = useNotifications(settings?.notificationsEnabled ?? false)
  const [showClear, setShowClear] = useState(false)
  const [importErr, setImportErr] = useState<string | null>(null)
  const [importOk, setImportOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setImportErr(null); setImportOk(false); setBusy(true)
    try {
      const text = await readFileAsText(file)
      const backup = parseBackup(text)
      await restoreHabits(backup.habits)
      await restoreLogs(backup.habitLogs)
      if (backup.settings) await restoreSettings(backup.settings)
      setImportOk(true)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) { setImportErr(err instanceof Error ? err.message : 'Import failed.') }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const toggleStyle = (on: boolean) => ({
    width: 46, height: 26, borderRadius: 13,
    background: on ? 'var(--c-primary)' : 'var(--c-border)',
    border: 'none', cursor: 'pointer', position: 'relative' as const,
    transition: 'background 0.2s', flexShrink: 0,
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Settings" />
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 680, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }} className="pb-nav">

        {/* Appearance */}
        <div>
          <SectionLabel>Appearance</SectionLabel>
          <SettingsCard>
            {/* Theme */}
            <div style={{ padding: '14px 16px 12px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 10px' }}>Theme</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => void setTheme(value)}
                    aria-pressed={theme === value}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 8px', borderRadius: 12,
                      border: `2px solid ${theme === value ? 'var(--c-primary)' : 'var(--c-border)'}`,
                      background: theme === value ? 'var(--c-primary-light)' : 'var(--c-card)',
                      color: theme === value ? 'var(--c-primary)' : 'var(--c-text-secondary)',
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Divider />
            {/* Week start */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text)', margin: 0 }}>Week starts on</p>
                <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>Affects history grid</p>
              </div>
              <div style={{ display: 'flex', background: 'var(--c-incomplete)', borderRadius: 8, padding: 2 }}>
                {([{ l: 'Mon', v: 1 }, { l: 'Sun', v: 0 }] as const).map(({ l, v }) => (
                  <button
                    key={v}
                    onClick={() => void update({ weekStartsOn: v })}
                    aria-pressed={settings?.weekStartsOn === v}
                    style={{
                      padding: '5px 12px', borderRadius: 6, border: 'none',
                      background: settings?.weekStartsOn === v ? 'var(--c-card)' : 'transparent',
                      color: settings?.weekStartsOn === v ? 'var(--c-text)' : 'var(--c-text-secondary)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: settings?.weekStartsOn === v ? 'var(--shadow-card)' : 'none',
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>
          </SettingsCard>
        </div>

        {/* Reminders */}
        <div>
          <SectionLabel>Reminders</SectionLabel>
          <SettingsCard>
            {!notifications.supported ? (
              <SettingsRow icon={<BellOff size={16} color="var(--c-text-secondary)" />} iconBg="var(--c-incomplete)" label="Not supported" sub="Your browser doesn't support notifications." />
            ) : notifications.permission === 'denied' ? (
              /* ── Denied: user must go to browser settings ── */
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BellOff size={16} color="#DC2626" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626', margin: '0 0 4px' }}>Notifications Blocked</p>
                    <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                      You blocked notifications for this site. To enable them:
                    </p>
                    <div style={{ background: 'var(--c-bg)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--c-border)' }}>
                      {[
                        'Tap the 🔒 lock icon in Chrome\'s address bar',
                        'Tap "Site settings"',
                        'Set Notifications → "Allow"',
                        'Reload the app',
                      ].map((step, i) => (
                        <p key={i} style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: i === 0 ? 0 : '4px 0 0', display: 'flex', gap: 8 }}>
                          <span style={{ color: 'var(--c-primary)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : notifications.permission === 'default' ? (
              /* ── Not asked yet: show Enable button ── */
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={16} color="var(--c-primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>Enable Reminders</p>
                    <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>
                      Get 7 daily nudges to stay consistent
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void notifications.toggle(true)}
                  style={{
                    width: '100%', height: 46, borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #1a5c3e, #2E7D5B, #4CAF78)',
                    color: '#FFF', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(46,125,91,0.35)',
                  }}
                >
                  <Bell size={16} />
                  Allow Notifications
                </button>
                <p style={{ fontSize: 11, color: 'var(--c-text-secondary)', textAlign: 'center', margin: '8px 0 0' }}>
                  Chrome will ask you to confirm. Tap "Allow".
                </p>
              </div>
            ) : (
              /* ── Granted: show toggle + test ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={16} color="var(--c-primary)" aria-hidden="true" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text)', margin: 0 }}>Daily Reminders</p>
                    <p style={{ fontSize: 12, color: notifications.enabled ? 'var(--c-primary)' : 'var(--c-text-secondary)', margin: '2px 0 0', fontWeight: notifications.enabled ? 600 : 400 }}>
                      {notifications.enabled ? '✓ 7 reminders active — 7am to 11pm' : 'Tap to activate daily reminders'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.enabled}
                    onClick={() => void notifications.toggle(!notifications.enabled)}
                    style={toggleStyle(notifications.enabled)}
                  >
                    <span style={{
                      position: 'absolute', top: 3, left: 3, width: 20, height: 20,
                      borderRadius: '50%', background: '#FFF',
                      transition: 'transform 0.2s',
                      transform: notifications.enabled ? 'translateX(20px)' : 'translateX(0)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
                {notifications.enabled && (
                  <>
                    <Divider />
                    <SettingsRow
                      icon={<Send size={15} color="var(--c-primary)" />}
                      iconBg="var(--c-primary-light)"
                      label="Send test notification"
                      sub="Tap to preview — confirm notifications are working"
                      onClick={notifications.sendTestNotification}
                    />
                  </>
                )}
              </>
            )}
          </SettingsCard>
        </div>

        {/* Data */}
        <div>
          <SectionLabel>Data Management</SectionLabel>
          <SettingsCard>
            <SettingsRow icon={<Download size={15} color="var(--c-primary)" />} iconBg="var(--c-primary-light)" label="Export Backup" sub="Save all habits & logs as JSON" onClick={() => void exportBackupJSON()} />
            <Divider />
            <SettingsRow icon={<Upload size={15} color="#059669" />} iconBg="#D1FAE5" label={busy ? 'Importing…' : 'Import Backup'} sub="Restore from a JSON backup file" onClick={() => fileRef.current?.click()} disabled={busy} />
            <Divider />
            <SettingsRow icon={<FileText size={15} color="#D97706" />} iconBg="#FEF3C7" label="Export CSV" sub="Spreadsheet-compatible export" onClick={() => void exportCSV()} />
            <Divider />
            <SettingsRow icon={<Trash2 size={15} color="#DC2626" />} iconBg="#FEE2E2" label="Clear All Data" sub="Delete all habits and logs" onClick={() => setShowClear(true)} danger />
          </SettingsCard>
          {importErr && <p role="alert" style={{ fontSize: 13, color: '#DC2626', margin: '8px 4px 0' }}>⚠️ {importErr}</p>}
          {importOk && <p role="status" style={{ fontSize: 13, color: 'var(--c-primary)', margin: '8px 4px 0' }}>✓ Imported successfully. Reloading…</p>}
        </div>

        {/* Notification Schedule Info */}
        {notifications.enabled && (
          <div>
            <SectionLabel>Notification Schedule</SectionLabel>
            <SettingsCard>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={14} color="#F59E0B" /> 7 Daily Reminders Active
                </p>
                {[
                  { time: '7:00 AM', label: 'Morning Kickstart', emoji: '🌅' },
                  { time: '10:00 AM', label: 'Mid-Morning Nudge', emoji: '⏰' },
                  { time: '1:00 PM', label: 'Post-Lunch Reminder', emoji: '🍱' },
                  { time: '4:00 PM', label: 'Afternoon Hustle', emoji: '💪' },
                  { time: '7:00 PM', label: 'Evening Check-In', emoji: '🌆' },
                  { time: '9:00 PM', label: 'Pre-Accountability Warning', emoji: '⚠️' },
                  { time: '11:00 PM', label: 'Final Accountability', emoji: '🌙' },
                ].map(({ time, label, emoji }) => (
                  <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--c-border)' }}>
                    <span style={{ fontSize: 16 }}>{emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-primary)', width: 64, flexShrink: 0 }}>{time}</span>
                    <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{label}</span>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'var(--c-text-secondary)', margin: '10px 0 0', lineHeight: 1.5 }}>
                  At 11pm, the app will automatically open an accountability check if you have incomplete habits.
                </p>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* About */}
        <div>
          <SectionLabel>About</SectionLabel>
          <SettingsCard>
            <div style={{ padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <Logo size={46} animate />
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text)', margin: 0, letterSpacing: '-0.02em' }}>
                    Habit<span style={{ color: 'var(--c-primary)' }}>Track</span>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>Version 1.0.0 · Build Better Days</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {[['🔒', 'Private'], ['📱', 'Offline'], ['🆓', 'Free']].map(([icon, label]) => (
                  <div key={label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--c-bg)', borderRadius: 10, border: '1px solid var(--c-border)' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-secondary)' }}>{label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'var(--c-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                All data lives on your device. No account, no cloud, no tracking. Works fully offline after installation.
              </p>
            </div>
          </SettingsCard>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".json,application/json" onChange={e => void handleImport(e)} className="sr-only" aria-label="Import backup file" />

      <ConfirmDialog
        open={showClear}
        title="Clear All Data"
        message="This will permanently delete all your habits, logs, and settings. This cannot be undone."
        confirmLabel="Clear Everything"
        destructive
        onConfirm={() => void clearAllData().then(() => window.location.reload())}
        onCancel={() => setShowClear(false)}
      />
    </div>
  )
}
