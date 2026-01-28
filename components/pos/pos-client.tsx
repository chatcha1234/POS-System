'use client'

import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/inventory-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/components/pos/cart-context'
import { processTransaction } from '@/lib/pos-actions'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ImageIcon, Loader2, X } from 'lucide-react'
import Image from 'next/image'

// Define Product type locally or import from Prisma
type Product = {
  id: string
  name: string
  price: number
  image: string | null
  inventory: { quantity: number; branchId: string }[]
}

interface POSClientProps {
    userId: string
    branchId: string
    initialProducts?: Product[]
}

export function POSClient({ userId, branchId, initialProducts = [] }: POSClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCart()

  useEffect(() => {
    // Only fetch if searching or if no initial products (though SSR should provide them)
    // If not searching and we have initial products, we don't need to fetch immediately
    if (search || products.length === 0) {
        getProducts(search).then((data) => setProducts(data as unknown as Product[]))
    }
  }, [search, products.length])

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    setIsProcessing(true)
    const result = await processTransaction(
        items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
        userId,
        branchId
    )
    setIsProcessing(false)

    if (result.success) {
        alert('ชำระเงินสำเร็จ!')
        clearCart()
        // Refresh products to show updated stock
        getProducts(search).then((data) => setProducts(data as unknown as Product[]))
    } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-6 gap-6 grid grid-cols-1 lg:grid-cols-3 bg-slate-50/50">
        {/* Product Grid Section */}
        <div className="lg:col-span-2 h-full flex flex-col gap-6 overflow-hidden">
            <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/50">
                <div className="flex-1 relative">
                    <Input 
                        placeholder="Search products, category, barcodes..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-10 pr-2 custom-scrollbar">
                {products.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                            <ImageIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">ไม่พบสินค้าในระบบ</p>
                    </div>
                )}
                {products.map((product) => (
                    <Card 
                        key={product.id} 
                        className="group relative cursor-pointer border-none shadow-premium hover:ring-2 hover:ring-primary/50 transition-all duration-300 h-fit flex flex-col overflow-hidden bg-white"
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
                    >
                        <div className="relative w-full aspect-square bg-slate-50 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ImageIcon className="h-16 w-16" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                <span className="bg-primary/95 text-white px-2 py-1 rounded-lg font-black text-sm shadow-lg backdrop-blur-sm">
                                    ฿{product.price.toLocaleString()}
                                </span>
                                <span className="bg-white/95 text-slate-600 px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm tracking-tight border border-slate-100">
                                    คงเหลือ: {product.inventory?.find(i => i.branchId === branchId)?.quantity || 0}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col gap-1">
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 min-h-10 leading-snug group-hover:text-primary transition-colors">{product.name}</h3>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        {/* Cart Sidebar Section */}
        <div className="h-full overflow-hidden flex flex-col bg-white rounded-3xl border border-slate-200/60 shadow-premium">
            <div className="p-6 border-b bg-slate-50/50">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">ตะกร้าสินค้า</h2>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">{items.length} รายการ</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{format(new Date(), 'EEEE dd MMM', { locale: th })}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60 px-10 text-center gap-4">
                        <div className="p-6 bg-slate-50 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        </div>
                        <p className="font-bold text-slate-400">ยังไม่มีสินค้าในตะกร้า<br/><span className="text-xs font-normal">เลือกสินค้าจากด้านซ้ายได้เลย</span></p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-50/80 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.name}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-black text-primary">฿{item.price.toLocaleString()}</p>
                                    <span className="text-[10px] text-slate-400">x {item.quantity}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    -
                                </Button>
                                <span className="w-6 text-center text-sm font-black text-slate-700">{item.quantity}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </Button>
                                <div className="h-4 w-px bg-slate-100 mx-1" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 border-t bg-slate-50/80 space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-slate-500 text-sm">
                        <span>ยอดรวม</span>
                        <span className="tabular-nums font-bold text-slate-700">฿{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-indigo-700">
                        <span className="font-black text-2xl uppercase tracking-tighter">รวมสุทธิ</span>
                        <span className="text-3xl font-black tabular-nums tracking-tight">฿{total.toLocaleString()}</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="outline" 
                        size="lg"
                        className="rounded-2xl h-14 font-bold border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                        onClick={clearCart} 
                        disabled={items.length === 0 || isProcessing}
                    >
                        ล้างตะกร้า
                    </Button>
                    <Button 
                        size="lg"
                        className="rounded-2xl h-14 text-lg font-black bg-primary hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 transition-all border-none" 
                        disabled={items.length === 0 || isProcessing}
                        onClick={handleCheckout}
                    >
                        {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : 'ชำระเงิน'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}
