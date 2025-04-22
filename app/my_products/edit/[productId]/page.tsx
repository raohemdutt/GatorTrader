"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash2, UploadCloud } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function EditProduct() {
  const router = useRouter();
  const { productId } = useParams() as { productId: string };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  async function fetchProduct() {
    setLoading(true);

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast.error("Please log in to edit your product");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      toast.error("Error loading product details");
      router.push("/products");
      return;
    }

    if (data.seller_id !== user.user.id) {
      toast.error("You do not have permission to edit this product");
      router.push("/products");
      return;
    }

    setTitle(data.title || "");
    setDescription(data.description || "");
    setPrice(data.price?.toString() || "");
    setCategory(data.category || "");
    setStatus(data.status || "active");
    setCurrentImageUrl(data.image_url || "");

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = currentImageUrl;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${productId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload the image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("product_images")
          .upload(filePath, image, { upsert: true });

        if (uploadError) throw uploadError;

        // Retrieve the public URL of the uploaded image
        const { data: publicUrlData} = await supabase.storage
          .from("product_images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      console.log("Updating product with:", {
        title,
        description,
        price: Number.parseFloat(price),
        category,
        status,
        image_url: imageUrl,
      });

      // Update product data in Supabase
      const { error } = await supabase
        .from("products")
        .update({
          title,
          description,
          price: Number.parseFloat(price),
          category,
          status,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (error) {
        console.error("Update Error:", error);
        toast.error("Error updating product. Please try again.");
      } else {
        toast.success("Product updated successfully!");
        router.push("/my_products");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", productId);
        if (error) throw error;

        toast.success("Product deleted successfully!");
        router.push("/my_products");
      } catch (error) {
        toast.error("Error deleting product. Please try again.");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <Button onClick={() => router.push("/my_products")} variant="outline" className="mb-6 flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Products
      </Button>

      <h1 className="text-3xl font-bold text-primary mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Product Image Section */}
        <div className="flex flex-col items-center space-y-4">
          {currentImageUrl && (
            <img
              src={currentImageUrl}
              alt="Product Image"
              className="max-h-64 rounded-lg border shadow-md"
            />
          )}
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)} required>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


        <div className="flex justify-between pt-4">
          <Button type="button" variant="destructive" onClick={handleDelete} className="flex items-center">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Product
          </Button>
          <Button type="submit" disabled={saving} className="flex items-center">
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
