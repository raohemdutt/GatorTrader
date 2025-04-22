"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  ShoppingBag
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Transaction {
  id: string;
  product_id: number;
  product_name: string;
  product_image: string | null;
  category: string;
  price: number;
  type: "purchase" | "sale";
  created_at: string;
  status: string;
  other_user_name: string;
  isBuyer: boolean;
}

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in to view your transactions");
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (txError || !txData) {
      console.error("Error fetching transactions:", txError);
      toast.error("Error loading transactions");
      return;
    }

    const productIds = [...new Set(txData.map((tx: any) => tx.product_id))];
    const { data: productsData } = await supabase
      .from("products")
      .select("id, title, image_url, category")
      .in("id", productIds);

    const productMap = Object.fromEntries(
      (productsData || []).map((p) => [p.id, p])
    );

    const userIds = [
      ...new Set(txData.flatMap((tx: any) => [tx.buyer_id, tx.seller_id]))
    ];

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    const profileMap = Object.fromEntries(
      (profilesData || []).map((p) => [p.id, p])
    );

    const mapped = txData.map((tx: any) => {
      const isBuyer = tx.buyer_id === user.id;
      const product = productMap[tx.product_id];
      const buyer = profileMap[tx.buyer_id];
      const seller = profileMap[tx.seller_id];

      return {
        id: tx.id,
        product_id: tx.product_id,
        product_name: product?.title || `Product #${tx.product_id}`,
        product_image: product?.image_url || null,
        price: tx.total_price,
        category: product?.category || "Unknown",
        type: (isBuyer ? "purchase" : "sale") as "purchase" | "sale",
        created_at: tx.created_at,
        status: tx.status,
        other_user_name: isBuyer ? seller?.username || "Seller" : buyer?.username || "Buyer",
        isBuyer
      };
    });

    setTransactions(mapped);
    setLoading(false);
  }

  async function handleAccept(txId: string, productId: number, transaction: Transaction) {
    // Step 1: Update the transaction and product status
    const { error: txError } = await supabase
      .from("transactions")
      .update({ status: "completed" })
      .eq("id", txId);
  
    const { error: productError } = await supabase
      .from("products")
      .update({ status: "sold" })
      .eq("id", productId);
  
    if (txError || productError) {
      console.error("Accept failed:", txError || productError);
      toast.error("Failed to complete transaction.");
      return;
    }
  
    // Step 2: Send TalkJS message
    if (typeof window !== "undefined" && window.Talk) {
      try {
        await window.Talk.ready;
  
        const currentUser = await supabase.auth.getUser();
        const selfId = currentUser.data?.user?.id;
        const selfEmail = currentUser.data?.user?.email;
  
        if (!selfId || !selfEmail) return;
  
        const { data: otherUser } = await supabase
          .from("profiles")
          .select("id, username, email, profile_picture")
          .eq("username", transaction.other_user_name)
          .single();
  
        if (!otherUser) return;
  
        const buyer = new window.Talk.User({
          id: selfId,
          name: selfEmail,
          email: selfEmail,
          photoUrl: "/placeholder.svg",
          welcomeMessage: "Purchase accepted.",
        });
  
        const seller = new window.Talk.User({
          id: otherUser.id,
          name: otherUser.username,
          email: otherUser.email,
          photoUrl: otherUser.profile_picture || "/placeholder.svg",
          welcomeMessage: "You've received a message.",
        });
  
        const session = new window.Talk.Session({
          appId: "tu3aoShQ",
          me: buyer,
        });
  
        const conversationId = window.Talk.oneOnOneId(buyer, seller);
        const conversation = session.getOrCreateConversation(conversationId);
        conversation.setParticipant(buyer);
        conversation.setParticipant(seller);
  
        conversation.sendMessage(
          `The buyer has accepted the transaction for "${transaction.product_name}" at $${transaction.price.toFixed(2)}. Thank you!`
        );
  
        session.destroy();
      } catch (e) {
        console.error("TalkJS error during accept:", e);
      }
    }
  
    toast.success("Transaction completed and product marked as sold.");
    fetchTransactions(); // Refresh list once message is sent
  }
      
  async function handleReject(txId: string, productId: number, transaction: Transaction) {
    // Step 1: Set product status back to active
    const { error: updateError } = await supabase
      .from("products")
      .update({ status: "active" })
      .eq("id", productId);
  
    if (updateError) {
      console.error("Product status update failed:", updateError);
      toast.error("Failed to reactivate product.");
      return;
    }
  
    // Step 2: Delete the transaction (after updating product to avoid FK issues)
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", txId);
  
    if (deleteError) {
      console.error("Transaction deletion failed:", deleteError);
      toast.error("Failed to reject transaction.");
      return;
    }
  
    toast.success(
      transaction.isBuyer
        ? "Transaction rejected and product reactivated."
        : "Transaction canceled and product reactivated."
    );
  
    // Step 3: Send TalkJS system message
    if (typeof window !== "undefined" && window.Talk) {
      await window.Talk.ready;
  
      const currentUser = await supabase.auth.getUser();
  
      const selfId = currentUser.data?.user?.id;
      const selfEmail = currentUser.data?.user?.email;
  
      const targetUsername = transaction.other_user_name;
  
      const { data: otherUser } = await supabase
        .from("profiles")
        .select("id, username, email, profile_picture")
        .eq("username", targetUsername)
        .single();
  
      if (!selfId || !selfEmail || !otherUser) return;
  
      const selfUser = new window.Talk.User({
        id: selfId,
        name: selfEmail,
        email: selfEmail,
        photoUrl: "/placeholder.svg",
        welcomeMessage: "You updated a transaction.",
      });
  
      const otherTalkUser = new window.Talk.User({
        id: otherUser.id,
        name: otherUser.username,
        email: otherUser.email,
        photoUrl: otherUser.profile_picture || "/placeholder.svg",
        welcomeMessage: "You have a transaction update.",
      });
  
      const session = new window.Talk.Session({
        appId: "tu3aoShQ", // replace with your actual TalkJS appId
        me: selfUser,
      });
  
      const conversationId = window.Talk.oneOnOneId(selfUser, otherTalkUser);
      const conversation = session.getOrCreateConversation(conversationId);
      conversation.setParticipant(selfUser);
      conversation.setParticipant(otherTalkUser);
  
      const messageText = transaction.isBuyer
      ? `The buyer has rejected the transaction for "${transaction.product_name}" at $${transaction.price.toFixed(2)}.`
      : `The seller has canceled the transaction for "${transaction.product_name}" at $${transaction.price.toFixed(2)}.`;
      
      conversation.sendMessage(messageText);
  
      session.destroy();
    }
  
    fetchTransactions();
  }
  
  const baseFiltered =
  activeTab === "pending"
    ? transactions.filter((tx) => tx.status === "pending")
    : activeTab === "all"
    ? transactions
    : transactions.filter((tx) => tx.type === activeTab);

const filteredTransactions = baseFiltered
  .filter((tx) => {
    const matchesProductName = tx.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesUsername = tx.other_user_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSearch = matchesProductName || matchesUsername;

    const matchesPrice = tx.price >= priceRange[0] && tx.price <= priceRange[1];

    const matchesCategory =
      categoryFilter === "all" || tx.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesPrice && matchesCategory;
    })
  .sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === "price_low_high") {
      return a.price - b.price;
    } else if (sortBy === "price_high_low") {
      return b.price - a.price;
    }
    return 0;
  });

  
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-primary mb-6">Your Transactions</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
  <Input
    type="search"
    placeholder="Search by product name or username"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="md:w-1/2"
        />
    
    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
    <SelectTrigger className="md:w-1/4">
      <SelectValue placeholder="Filter by category" />
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
    <SelectTrigger className="md:w-1/3">
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

      

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
          <TabsTrigger value="sale">Sales</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No transactions in this tab.
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
                        <Badge variant="outline" className="capitalize">{transaction.type}</Badge>
                        <Badge variant="outline" className="ml-2 text-xs capitalize">
                          {transaction.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        {transaction.product_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        Category: {transaction.category}
                      </p>

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
                      {activeTab === "pending" && transaction.isBuyer && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(transaction.id, transaction.product_id, transaction)}
                          >
                            Accept
                          </Button>
                          <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleReject(transaction.id, transaction.product_id, transaction)
                              }
                            >
                              Reject
                            </Button>
                        </>
                      )}
                      {activeTab === "pending" && !transaction.isBuyer && (
                        <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleReject(transaction.id, transaction.product_id, transaction)
                        }
                      >
                        Cancel
                      </Button>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
