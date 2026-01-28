'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Save, Loader2 } from 'lucide-react'
import { updateShopName } from '@/lib/settings-actions'

interface SettingsFormProps {
  initialShopName: string
}

export function SettingsForm({ initialShopName }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const result = await updateShopName(formData)

    setIsLoading(false)
    if (result.success) {
      setMessage('บันทึกข้อมูลสำเร็จ!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      alert(result.error || 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            ชื่อร้าน (Shop Name)
        </label>
        <Input 
            name="shopName" 
            defaultValue={initialShopName} 
            placeholder="เช่น สมชาย วัสดุก่อสร้าง" 
            className="h-14 text-lg font-bold border-slate-200 focus:border-primary focus:ring-primary/20 rounded-2xl bg-white shadow-sm"
            required 
            disabled={isLoading}
        />
        <p className="text-xs text-slate-400 font-medium">ระบุชื่อร้านทางการที่จะใช้แสดงผลบนแถบเมนูหลักของระบบ</p>
      </div>

      {message && (
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-top-1">
              {message}
          </div>
      )}

      <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
                <Save className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
      </div>
    </form>
  )
}
