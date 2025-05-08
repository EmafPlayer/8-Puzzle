import React from 'react';
import { twMerge } from 'tailwind-merge';

type MeuBotaoProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Peca (props: MeuBotaoProps) {

  return (
    <button {...props} className={twMerge("w-[10rem] h-[10rem] rounded-lg col-span-1 border-slate-900", props.children === 0 ? "bg-slate-200 border border-[#A67A44] shadow-xl" : props.children === -1 ? "bg-slate-600" : " bg-[#A67A44] shadow-lg", props.children != -1 && "cursor-default")}>
      <div className="flex justify-center items-center w-full h-full text-white text-[2.5rem] font-bold">
        {props.children === 0 || props.children === -1 ? "" : props.children}
      </div>
    </button>
  );
  
};