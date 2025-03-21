"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  image_url: string;
  seller_id: string;
  seller_username?: string;
}

export default function ProductDetails() {
  const router = useRouter();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyerUsername, setBuyerUsername] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (productId) fetchProductDetails();
  }, [productId]);

  async function fetchProductDetails() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, profiles(username)")
      .eq("id", productId)
      .single();

    if (error || !data) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } else {
      setProduct({
        ...data,
        seller_username: data.profiles?.username || "Unknown",
      });
    }
    setLoading(false);
  }

  async function handleMarkAsSold() {
    if (!buyerUsername.trim() || !finalPrice) {
      toast.error("Please enter both buyer's username and final price.");
      return;
    }

    setProcessing(true);

    try {
      const { data: buyerData, error: buyerError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", buyerUsername.trim())
        .single();

      if (buyerError || !buyerData) {
        toast.error(`Buyer with username "${buyerUsername}" not found.`);
        return;
      }

      const buyerId = buyerData.id;
      const sellerId = product?.seller_id;

      if (!product || !sellerId) return;

      // Insert transaction
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          product_id: product.id,
          buyer_id: buyerId,
          seller_id: sellerId,
          total_price: Number.parseFloat(finalPrice),
        },
      ]);

      if (transactionError) throw transactionError;

      // Remove product
      const { error: updateError } = await supabase
      .from("products")
      .update({ status: "sold", updated_at: new Date().toISOString() })
      .eq("id", product.id);
    
      if (updateError) {
        throw updateError;
      }
    
      toast.success("Product sold and recorded successfully!");
      router.push("/my_products");
    } catch (error) {
      console.error("Error marking product as sold:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return <p className="text-center text-red-500">Product not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-center">{product.title}</h1>

      <Button onClick={() => router.push("/my_products")} variant="outline" className="mb-6 flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Products
      </Button>

      {/* Product Image */}
      <div className="flex justify-center">
        <Image
          src={product.image_url || "/placeholder.svg"}
          alt={product.title}
          width={400}
          height={400}
          className="rounded-lg shadow-md"
        />
      </div>

      {/* Product Info */}
      <div className="bg-white p-6 shadow-md rounded-lg space-y-4">
        <p className="text-gray-700">{product.description}</p>
        <p className="text-green-600 text-xl font-bold">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Category: {product.category}</p>
        <p className="text-sm text-gray-500">Listed by: <span className="font-semibold">{product.seller_username}</span></p>
      </div>

      {/* Buyer and Price */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyerUsername">Buyer Username</Label>
          <Input
            id="buyerUsername"
            placeholder="Enter buyer's username"
            value={buyerUsername}
            onChange={(e) => setBuyerUsername(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="finalPrice">Final Price ($)</Label>
          <Input
            id="finalPrice"
            type="number"
            placeholder="Enter final price"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          onClick={handleMarkAsSold}
          disabled={processing}
          className="w-32"
        >
          {processing ? "Processing..." : "Sell"}
        </Button>
      </div>
    </div>
  );
}
