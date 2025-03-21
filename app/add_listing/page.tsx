"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "react-hot-toast"

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast.error("You must be logged in to add a listing. Please try again.")
      alert("You must be logged in to add a listing.");
      setLoading(false);
      return;
    }

    let imageUrl = "";

    if (imageFile) {
      try {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload the image to Supabase Storage
        const { data, error } = await supabase.storage
          .from("product_images")
          .upload(filePath, imageFile, { upsert: true });

        if (error) throw error;

        // Retrieve the public URL of the uploaded image
        const { data: publicUrlData } = await supabase.storage
          .from("product_images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      } catch (error) {
        console.error("Error uploading product image:", error);
        alert("Error uploading product image.");
        toast.error("Error uploading product image. Please try again.")
        setLoading(false);
        return;
      }
    }

    // Insert the product into the database
    const { data, error } = await supabase.from("products").insert([
      {
        title,
        description,
        price,
        category,
        image_url: imageUrl, // Store the image URL
        seller_id: user.id, 
        status: "active",
      },
    ]);

    if (error) {
      toast.error("Error adding product. Please try again.")
      alert("Error adding product: " + error.message);
      setLoading(false);
    } else {
      toast.success("Succesfully added product.")
      router.push(`/dashboard/${user.id}`);
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
              <SelectItem value="Books">Books</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium">
            Upload Product Image
          </label>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" disabled={loading} className="w-full md:w-1/2">
            {loading ? "Adding..." : "Add Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
