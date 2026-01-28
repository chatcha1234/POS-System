'use client'

import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/inventory-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/components/pos/cart-context'
import { processTransaction } from '@/lib/pos-actions'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

// Define Product type locally or import from Prisma
type Product = {
  id: string
  name: string
  price: number
  inventory: { quantity: number; branchId: string }[]
}

interface POSClientProps {
    userId: string
    branchId: string
}

export function POSClient({ userId, branchId }: POSClientProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCart()

  useEffect(() => {
    getProducts(search).then((data) => setProducts(data as unknown as Product[]))
  }, [search])

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
    <div className="h-[calc(100vh-4rem)] p-4 gap-4 grid grid-cols-1 lg:grid-cols-3">
        {/* Product Grid Section */}
        <div className="lg:col-span-2 h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex gap-2">
                <Input 
                    placeholder="ค้นหาสินค้า (ชื่อ หรือ บาร์โค้ด)..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
                {products.map((product) => (
                    <Card 
                        key={product.id} 
                        className="cursor-pointer hover:border-primary transition-colors h-fit"
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
                    >
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium line-clamp-2">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-lg font-bold text-primary">฿{product.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">คงเหลือ: {product.inventory?.find(i => i.branchId === branchId)?.quantity || 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {/* Cart Sidebar Section */}
        <div className="h-full overflow-hidden flex flex-col bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/50">
                <h2 className="font-semibold text-lg">ตะกร้าสินค้า</h2>
                <p className="text-sm text-muted-foreground">{format(new Date(), 'dd MMMM yyyy HH:mm', { locale: th })}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        ยังไม่มีสินค้าในตะกร้า
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-zinc-50 p-2 rounded">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">฿{item.price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    -
                                </Button>
                                <span className="w-4 text-center text-sm">{item.quantity}</span>
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => removeItem(item.id)}
                                >
                                    x
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t bg-muted/50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>รวมทั้งหมด</span>
                    <span>฿{total.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="destructive" onClick={clearCart} disabled={items.length === 0 || isProcessing}>
                        ล้างตะกร้า
                    </Button>
                    <Button 
                        className="w-full" 
                        disabled={items.length === 0 || isProcessing}
                        onClick={handleCheckout}
                    >
                        {isProcessing ? 'กำลังประมวลผล...' : 'ชำระเงิน'}
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}
