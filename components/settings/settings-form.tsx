'use client'

import { Building2 } from 'lucide-react'

export function SettingsForm() {
  return (
    <div className="space-y-6">
      <div className="p-10 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <Building2 className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium italic">ขณะนี้ยังไม่มีการตั้งค่าอื่นๆ เพิ่มเติม</p>
      </div>
    </div>
  )
}
