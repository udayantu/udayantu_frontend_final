import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExportPayments } from "./ExportPayments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "./shared/PaginationControls";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { StatCard } from "./shared/StatCard";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  currency: string;
  method: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  created_at: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "p1",
    user_id: "u1",
    amount: 499900,
    status: "success",
    currency: "INR",
    method: "upi",
    razorpay_order_id: "order_KkW3As8a2d1f",
    razorpay_payment_id: "pay_KkW3As9f8e7d",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "p2",
    user_id: "u2",
    amount: 499900,
    status: "pending",
    currency: "INR",
    method: "card",
    razorpay_order_id: "order_JnW4As7a3d1c",
    razorpay_payment_id: "",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const ITEMS_PER_PAGE = 10;

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, pending: 0, revenue: 0 });
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      let query = supabase
        .from("payments")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`razorpay_order_id.ilike.%${searchTerm}%,razorpay_payment_id.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      setPayments(data || []);
      setFilteredPayments(data || []);
      setTotalCount(count || 0);

      const successCount = data?.filter(p => p.status === 'success').length || 0;
      const pendingCount = data?.filter(p => p.status === 'created' || p.status === 'pending').length || 0;
      const revenue = data?.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        total: count || 0,
        success: successCount,
        pending: pendingCount,
        revenue: revenue / 100,
      });
    } catch (error: unknown) {
      console.warn("Could not load payments from live database. Initializing clean/empty state.");
      const stored = localStorage.getItem("udayantu_payments");
      let allPayments = stored ? JSON.parse(stored) as Payment[] : [];

      let results = [...allPayments];

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter((p) => 
          p.razorpay_order_id?.toLowerCase().includes(lower) ||
          p.razorpay_payment_id?.toLowerCase().includes(lower)
        );
      }

      if (statusFilter !== "all") {
        results = results.filter((p) => p.status === statusFilter);
      }

      setTotalCount(results.length);
      const sliced = results.slice(from, to + 1);
      setPayments(sliced);
      setFilteredPayments(sliced);

      const successCount = results.filter(p => p.status === 'success').length;
      const pendingCount = results.filter(p => p.status === 'created' || p.status === 'pending').length;
      const revenue = results.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

      setStats({
        total: results.length,
        success: successCount,
        pending: pendingCount,
        revenue: revenue / 100,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      created: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Payments"
          value={stats.total}
          description="All payment attempts"
          icon={DollarSign}
        />
        <StatCard
          title="Successful Payments"
          value={stats.success}
          description={`${Math.round((stats.success / stats.total) * 100)}% success rate`}
          icon={CheckCircle}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pending}
          description="Awaiting completion"
          icon={Clock}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          description="Successful payments only"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Payments Management</CardTitle>
          <ExportPayments />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.razorpay_order_id}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.razorpay_payment_id || "N/A"}
                    </TableCell>
                    <TableCell>
                      {payment.currency} {(payment.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{payment.currency}</TableCell>
                    <TableCell>{payment.method || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No payments found
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="pt-6 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-xs break-all">{payment.razorpay_order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs break-all">{payment.razorpay_payment_id || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">{payment.currency} {(payment.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p>{payment.method || "N/A"}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <p className="text-sm text-muted-foreground">Status:</p>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </CardContent>
    </Card>
    </div>
  );
}
