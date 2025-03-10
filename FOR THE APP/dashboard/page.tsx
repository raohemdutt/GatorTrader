"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
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
  price: number;
  category: string;
  created_at: string;
  image_url: string;
}

export default function Dashboard() {
  const params = useParams();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(false);

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

  // ✅ Filter products based on search/category/sort
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  }

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
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="furniture">Furniture</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="other">Other</SelectItem>
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
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
        />
      </div>

      {/* ✅ Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
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

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={() => router.push("/add-listing")}
          disabled={loading}
          className="w-full md:w-1/2 py-3 text-lg font-semibold"
        >
          {loading ? (
            <div className="animate-spin border-4 border-t-4 border-primary rounded-full w-6 h-6"></div>
          ) : (
            "Add Listing"
          )}
        </Button>
      </div>
    </div>
  );
}
