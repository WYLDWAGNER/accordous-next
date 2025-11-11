import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LicenseContextType {
  isValid: boolean;
  expiresAt: string | null;
  loading: boolean;
  canEdit: boolean;
  daysRemaining: number | null;
  isTrial: boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

const CACHE_KEY = 'license_check';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const LicenseProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LicenseContextType>({
    isValid: true,
    expiresAt: null,
    loading: true,
    canEdit: true,
    daysRemaining: null,
    isTrial: false,
  });

  const checkLicense = async (skipCache = false) => {
    try {
      // Check cache first
      if (!skipCache) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setState({ ...data, loading: false });
            return;
          }
        }
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({
          isValid: false,
          expiresAt: null,
          loading: false,
          canEdit: false,
          daysRemaining: null,
          isTrial: false,
        });
        return;
      }

      // Call license verification edge function
      const { data, error } = await supabase.functions.invoke('license-verify', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('License check error:', error);
        setState({
          isValid: false,
          expiresAt: null,
          loading: false,
          canEdit: false,
          daysRemaining: null,
          isTrial: false,
        });
        return;
      }

      // Calculate days remaining
      let daysRemaining: number | null = null;
      let isTrial = false;
      
      if (data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if it's a trial (14 days or less from creation)
        if (daysRemaining <= 14 && daysRemaining > 0) {
          isTrial = true;
        }
      }

      const licenseData = {
        isValid: data.valid,
        expiresAt: data.expires_at,
        canEdit: data.valid,
        daysRemaining,
        isTrial,
      };

      // Cache the result
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: licenseData,
        timestamp: Date.now()
      }));

      setState({ ...licenseData, loading: false });
    } catch (error) {
      console.error('License check failed:', error);
      setState({
        isValid: false,
        expiresAt: null,
        loading: false,
        canEdit: false,
        daysRemaining: null,
        isTrial: false,
      });
    }
  };

  useEffect(() => {
    checkLicense();

    // Check every 10 minutes
    const interval = setInterval(() => checkLicense(true), CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <LicenseContext.Provider value={state}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
};
