import { HTMLAttributes, PropsWithChildren } from "react";
import classnames from "classnames";

export type PanelProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default ({className, children, ...htmlProps}: PanelProps) => {
    const cssClasses = classnames("panel", className);
    return (
        <div {...htmlProps} className={cssClasses}>{children}</div>
    )
}