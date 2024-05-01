import React from "react";

const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-4xl mb-4">{children}</div>;
};

export default PageHeader;
