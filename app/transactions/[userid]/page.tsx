"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@supabase/supabase-js"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  ShoppingBag
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Transaction {
  id: string
  product_id: number
  product_name: string
  product_image: string | null
  price: number
  type: "purchase" | "sale"
  created_at: string
  other_user_name: string
}

export default function Transactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    const {
      data: { user }
    } = await supabase.auth.getUser()
  
    if (!user) {
      toast.error("Please log in to view your transactions")
      router.push("/login")
      return
    }
  
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
  
    if (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Error loading transactions")
      return
    }
  
    // Temporarily render without product name/image or usernames
    const mapped = (data || []).map((tx: any) => ({
        id: tx.id,
        product_id: tx.product_id,
        product_name: `Product #${tx.product_id}`,
        product_image: null,
        price: tx.total_price,
        type: (tx.buyer_id === user.id ? "purchase" : "sale") as "purchase" | "sale",
        created_at: tx.created_at,
        other_user_name: tx.buyer_id === user.id ? `Seller` : `Buyer`
      }))
        
    setTransactions(mapped)
    setLoading(false)
  }
  
  const filteredTransactions =
    activeTab === "all" ? transactions : transactions.filter((tx) => tx.type === activeTab)

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-primary mb-6">Your Transactions</h1>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
          <TabsTrigger value="sale">Sales</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {activeTab === "all"
              ? "You have no transactions yet"
              : activeTab === "purchase"
              ? "You haven't purchased any items yet"
              : "You haven't sold any items yet"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 lg:w-1/5">
                  <div className="aspect-square md:h-full">
                    <img
                      src={transaction.product_image || "/placeholder.svg"}
                      alt={transaction.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        {transaction.type === "purchase" ? (
                          <ArrowDownLeft className="h-4 w-4 mr-2 text-blue-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                        )}
                        <Badge variant="outline">{transaction.type}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        {/* <a href={`/product/${transaction.product_id}`} className="hover:underline"> */}
                          {transaction.product_name}
                        {/* </a> */}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-bold">${transaction.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(transaction.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        <span>
                          {transaction.type === "purchase"
                            ? `Seller: ${transaction.other_user_name}`
                            : `Buyer: ${transaction.other_user_name}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/product/${transaction.product_id}`)}
                      >
                        View Product
                      </Button> */}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
