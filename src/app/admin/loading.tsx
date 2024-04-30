import React from "react";
import { Loader2 } from "lucide-react";

const AdminLoading = () => {
  return (
    <div className="flex justify-center">
      <Loader2 size={24} className="animate-spin" />
    </div>
  );
};

export default AdminLoading;
