import React from "react";
import Router from "next/router";
import { TermProps } from "../types";

const Term: React.FC<{ data: TermProps }> = ({ data }) => {
  return (
    <div
      key={data.id}
      onClick={() => Router.push("/term/[termId]", `/term/${data.id}`)}
      className="text-h2 text-brand-dark-gray dark:text-brand-light-gray leading-[114%] -tracking-[0.03em] font-normal relative hover:"
    >
      <span>{data.title}</span>
      <span>→</span>
    </div>
  );
};

export default Term;
