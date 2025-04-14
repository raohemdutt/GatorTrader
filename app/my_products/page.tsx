"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Plus, Pencil, Trash2, DollarSign, CheckCircle } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

interface Product {
  id: number
  title: string
  price: number
  category: string
  created_at: string
  image_url: string
  description: string
  seller_id: string
  status: string
}

export default function MyProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState("newest")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all");
  useEffect(() => {
    fetchUserProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, statusFilter])

  async function fetchUserProducts() {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in to view your products")
      router.push("/login")
      return
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      toast.error("Error loading your products")
    } else {
      setProducts(data || [])
    }

    setLoading(false)
  }

  async function handleDeleteProduct(productId: number) {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", productId)

        if (error) throw error

        toast.success("Product deleted successfully")
        setProducts((prev) => prev.filter((product) => product.id !== productId))
      } catch (error) {
        console.error("Error deleting product:", error)
        toast.error("Error deleting product")
      }
    }
  }

  function filterProducts() {
    const filtered = products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === "" ||
        product.category === selectedCategory ||
        selectedCategory === "all"
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesStatus =
      (statusFilter === "all" && (product.status === "active" || product.status === "inactive")) ||
        product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStatus
    })

    if (sortBy === "newest") {
      filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    } else if (sortBy === "price_low_high") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price_high_low") {
      filtered.sort((a, b) => b.price - a.price)
    }

    setFilteredProducts(filtered)
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
      
    <h1 className="text-3xl font-bold text-primary mb-6">My Listings</h1>
     
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => router.push("/add_listing")} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> List New Product
        </Button>
      </div>


      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="search"
          placeholder="Search your products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Books">Books</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Furniture">Furniture</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price_low_high">Price: Low to High</SelectItem>
            <SelectItem value="price_high_low">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 mb-6">
        <label className="text-sm font-medium">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>
        <Slider
          min={0}
          max={10000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
        />
      </div>

      <Tabs defaultValue="all" onValueChange={setStatusFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">You haven't listed any products yet</p>
          <Button onClick={() => router.push("/sell")} className="mt-4">
            List Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={product.image_url || "/placeholder.svg?height=300&width=300"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                <div className="flex items-center mt-2 text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Category: {product.category}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Listed on {new Date(product.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center"
                    onClick={() => router.push(`/my_products/edit/${product.id}`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center justify-center"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="w-full flex items-center justify-center "
                  onClick={() => router.push(`/my_products/mark_as_sold/${product.id}`)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Sell
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
