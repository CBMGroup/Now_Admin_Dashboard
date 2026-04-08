import { Save, Bell, Shield, Palette, Database, Mail } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { useState } from 'react';

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F1F1F1]">Settings</h1>
        <p className="text-[#A3A3A3] mt-1">Manage your platform preferences and configurations</p>
      </div>

      {/* General Settings */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
        <div className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F1F1]">General</h2>
              <p className="text-sm text-[#A3A3A3]">Basic platform settings</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="NowPlay"
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
              Admin Email
            </label>
            <input
              type="email"
              defaultValue="admin@nowplay.com"
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F1F1F1] mb-2">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@nowplay.com"
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F1F1F1] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
        <div className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F1F1]">Notifications</h2>
              <p className="text-sm text-[#A3A3A3]">Configure notification preferences</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-[#F1F1F1]">Email Notifications</p>
              <p className="text-sm text-[#A3A3A3]">Receive email updates about platform activity</p>
            </div>
            <Switch.Root
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-[#2A2A2A]">
            <div>
              <p className="font-medium text-[#F1F1F1]">Push Notifications</p>
              <p className="text-sm text-[#A3A3A3]">Receive browser push notifications</p>
            </div>
            <Switch.Root
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
              className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
        <div className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F1F1]">Security</h2>
              <p className="text-sm text-[#A3A3A3]">Manage security and authentication</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-[#F1F1F1]">Two-Factor Authentication</p>
              <p className="text-sm text-[#A3A3A3]">Add an extra layer of security to your account</p>
            </div>
            <Switch.Root
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
              className="w-11 h-6 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#22C55E] transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>

          <div className="pt-3 border-t border-[#2A2A2A]">
            <button className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F1F1F1] rounded-lg font-medium transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
        <div className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F1F1]">Database & Backup</h2>
              <p className="text-sm text-[#A3A3A3]">Manage data and backups</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#F1F1F1]">Last Backup</p>
              <p className="text-sm text-[#A3A3A3]">March 31, 2026 at 11:30 PM</p>
            </div>
            <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-500/20">
              Backup Now
            </button>
          </div>
          <div className="pt-3 border-t border-[#2A2A2A]">
            <p className="text-sm text-[#A3A3A3] mb-3">Database Size: 2.4 GB</p>
            <div className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#22C55E] w-[45%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button className="px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
        <button className="px-6 py-2.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#F1F1F1] rounded-lg font-medium transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
