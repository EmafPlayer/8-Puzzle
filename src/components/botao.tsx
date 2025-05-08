import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

interface BotaoProps extends ComponentProps <"button"> {

    children: string

}


export function Botao ( props: BotaoProps ) {

    return (
        <button {...props} className={twMerge("px-10 py-3 font-medium rounded-md shadow-xl border border-black", props.className)}>{props.children}</button>
    )

}