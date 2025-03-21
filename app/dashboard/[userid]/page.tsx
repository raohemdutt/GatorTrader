"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast"
import { ArrowLeft, Plus, Pencil, Trash2, DollarSign, CheckCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  image_url: string;
  seller_id: string;
  seller_username?: string; // To store the username of the seller
}

export default function Dashboard() {
  const params = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch logged-in user data
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login"); // Redirect to login if not authenticated
      } else {
        setUserId(data.user.id);
      }
    }
    fetchUser();
  }, []);

  // ✅ Fetch products after user is identified
  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId]);


  // ✅ Fetch products from Supabase
  async function fetchProducts() {
    if (!userId) {
      setMessage("Error: No user ID found in URL.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select() // Explicit join
        .eq("status", "active") // ✅ Fetch only active products


    
      if (error) throw error;
      if (!data || data.length === 0) {
        console.log("No products found in the database.");
        setMessage("No products found.");
        return;
      }

      console.log("Fetched Active Products:", data);
      setProducts(data); // Set the state with fetched products

    } catch (error: any) {
      console.error("Unexpected error:", error);
      setMessage("Unexpected error occurred.");
    }
  }
      

    // ✅ Filter products based on search/category/sort
    useEffect(() => {
      filterProducts();
    }, [products, searchTerm, selectedCategory, priceRange, sortBy]);
  
  function filterProducts() {
    const filtered = products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "" ||
        product.category === selectedCategory ||
        selectedCategory === "all";
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "price_low_high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high_low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Welcome to Gator Marketplace
      </h1>

      {/* ✅ Navigation for logged-in user */}
      {userId && (
        <nav className="flex justify-center space-x-6 mt-4">
          {/* <Link href={`/profile/${userId}`} className="text-primary font-medium hover:underline">
            Profile
          </Link>
          <Link href="/about" className="text-primary font-medium hover:underline">
            About
          </Link>
          <Link href="/contact" className="text-primary font-medium hover:underline">
            Contact
          </Link> */}
        </nav>
      )}

      {/* ✅ Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search products..."
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

      <div className="space-y-2">
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

      <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-left mb-6">
        <Button onClick={() => router.push("/add_listing")} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> List New Product
        </Button>
      </div>
      </div>

      {/* ✅ Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Link href={`/dashboard/${userId}/product/${product.id}`} key={product.id}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
                <p className="text-2xl font-bold">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Listed on {new Date(product.created_at).toLocaleDateString()}
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500">
          No products found matching your criteria.
        </p>
      )}


    </div>
  );
}