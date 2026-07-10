import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const usePaymentStatus = () => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!user) {
        setPaymentStatus(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('student_registrations')
          .select('payment_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setPaymentStatus(data?.payment_status || null);
      } catch (error) {
        console.error('Error fetching payment status:', error);
        setPaymentStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [user]);

  return { paymentStatus, loading, isPaid: paymentStatus === 'paid' };
};
