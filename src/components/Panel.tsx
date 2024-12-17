import { HTMLAttributes, PropsWithChildren } from "react";
import styles from './Panel.module.scss';
import classnames from "classnames";

export type PanelProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default ({className, children, ...htmlProps}: PanelProps) => {
    const cssClasses = classnames(styles.view, className);
    return (
        <div {...htmlProps} className={cssClasses}>{children}</div>
    )
}