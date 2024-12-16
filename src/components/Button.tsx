import { PropsWithChildren } from "react"

export default (props: PropsWithChildren) => {
    return (
        <button>{props.children}</button>
    )
}