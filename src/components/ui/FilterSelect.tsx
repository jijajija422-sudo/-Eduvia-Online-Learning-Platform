"use client";

import React from "react";

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function FilterSelect({ children, ...props }: FilterSelectProps) {
  return (
    <select
      {...props}
      onChange={(e) => {
        e.target.form?.submit();
      }}
    >
      {children}
    </select>
  );
}
