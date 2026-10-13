import Panel from "@/components/Panel";
import ToggleButton from "@/components/ToggleButton";
import React, { PropsWithChildren, useState } from "react";
import styles from "./MenuPanel.module.scss";
import MenuToggleIcon from "@/img/bars.svg";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const MenuPanel: React.FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t: translate } = useTranslation();

  const menuIcon = (
    <Image
      priority
      src={MenuToggleIcon}
      alt="Menu button"
      width="18"
      height="18"
    />
  );

  return (
    <div className="relative w-fit">
      <div className="panel flex-row items-center justify-start gap-4">
        <span className="hidden font-sans text-base font-normal lg:inline">
          {translate("AppTitle")}
        </span>
        <ToggleButton
          onToggle={setIsOpen}
          icon={menuIcon}
          id="menu-panel-toggle-button"
          alt="Menu button"
          aria-haspopup="menu"
          aria-controls="menu-popup"
          aria-expanded={isOpen}
        ></ToggleButton>
      </div>
      <div id="menu-popup" className={styles.popup} data-open={isOpen}>
        <Panel>
          <ul role="menu" aria-labelledby="menu-panel-toggle-button">
            <li role="menuitem">
              <Link href="/">Item 1</Link>
            </li>
            <li role="menuitem">
              <Link href="/">Item 2</Link>
            </li>
            <li role="menuitem">
              <Link href="/">Item 3</Link>
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
};

export default MenuPanel;
