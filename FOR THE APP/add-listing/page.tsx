"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AddListing() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = await supabase.auth.getUser();

    if (!user.data?.user) {
      alert("You must be logged in to add a listing.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from("products").insert([
      {
        title,
        description,
        price,
        category,
        image_url: imageUrl,
        seller_id: user.data.user.id,
        created_at: new Date(),
      },
    ]);

    if (error) {
      alert("Error adding product: " + error.message);
      setLoading(false);
    } else {
      router.push("/dashboard"); // Redirect to dashboard after adding
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Add a New Listing</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 space-y-6">
        {/* Product Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product title"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            required
          />
        </div>

        {/* Product Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price ($)
          </label>
          <Input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter product price"
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Product Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Image URL */}
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium">
            Image URL
          </label>
          <Input
            type="url"
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter product image URL"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" disabled={loading} className="w-full md:w-1/2">
            {loading ? <Loader /> : "Add Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
