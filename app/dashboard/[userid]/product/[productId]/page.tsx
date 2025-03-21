"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  const params = useParams();
  const productId = params?.productId; // Get product ID from URL
  // const productId = Array.isArray(params?.productId) ? params.productId[0] : params?.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  async function fetchProductDetails() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*, profiles(username)")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
    } else {
      setProduct({
        ...data,
        seller_username: data.profiles?.username || "Unknown",
      });
    }
    setLoading(false);
  }

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!product) return <p className="text-center text-gray-500">Product not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">{product.title}</h1>

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

      {/* Product Details */}
      <div className="bg-white p-6 shadow-lg rounded-lg space-y-4">
        <p className="text-lg text-gray-700">{product.description}</p>
        <p className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Category: {product.category}</p>
        <p className="text-sm text-gray-500">
          Listed by: <span className="font-semibold">{product.seller_username}</span>
        </p>
      </div>

      {/* Message Seller Button (Currently Empty) */}
      <div className="flex justify-center">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3">
          Message Seller
        </Button>
      </div>
    </div>
  );
}
