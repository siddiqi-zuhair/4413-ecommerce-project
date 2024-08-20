import React, { useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";

type WithAdminProps = {
  children: React.ReactNode;
};

function withAdmin<T extends WithAdminProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ComponentWithAdmin(props: T) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;
    }, [loading]);

    if (loading) {
      return <Loading />;
    }
    if (!isAuthenticated || !user?.is_admin) {
      return ( 
        <div className="w-full min-h-[calc(100vh-144px)] text-6xl font-bold flex items-center justify-center bg-gray-200 text-gray-600 ">
            Admin page. You are not authorized to view this page
        </div>
      )
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAdmin;
