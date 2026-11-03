import { MenuIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CaseLookupDialog from "./CaseLookupDialog";

const MenuPanel = () => {
  const { t: translate } = useTranslation();
  const [isCaseLookupOpen, setIsCaseLookupOpen] = useState(false);

  return (
    <Card
      size="sm"
      className="w-fit flex-row items-center justify-start gap-4 px-3"
    >
      <span className="hidden font-sans text-base font-normal lg:inline">
        {translate("AppTitle")}
      </span>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          aria-label={translate("MenuButton")}
        >
          <MenuIcon />
        </Button>
        <DropdownMenu className="w-48">
          <DropdownMenuItem
            textValue={translate("GoToCaseNumber")}
            onAction={() => setIsCaseLookupOpen(true)}
          >
            <SearchIcon aria-hidden />
            {translate("GoToCaseNumber")}
          </DropdownMenuItem>
          <DropdownMenuItem href="/">
            {translate("MenuItem", { number: 1 })}
          </DropdownMenuItem>
          <DropdownMenuItem href="/">
            {translate("MenuItem", { number: 2 })}
          </DropdownMenuItem>
          <DropdownMenuItem href="/">
            {translate("MenuItem", { number: 3 })}
          </DropdownMenuItem>
        </DropdownMenu>
      </DropdownMenuTrigger>
      <CaseLookupDialog
        isOpen={isCaseLookupOpen}
        onOpenChange={setIsCaseLookupOpen}
      />
    </Card>
  );
};

export default MenuPanel;
