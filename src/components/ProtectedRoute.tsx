import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleData) {
          setUserRole(roleData.role as UserRole);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!userRole) {
        navigate('/signin');
      } else if (allowedRoles && !allowedRoles.includes(userRole)) {
        navigate('/');
      }
    }
  }, [loading, userRole, navigate, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return <>{children}</>;
};

export default ProtectedRoute;
