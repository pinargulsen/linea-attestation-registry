import { t } from "i18next";
import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Buttons";
import { EButtonType } from "@/components/Buttons/enum";
import { EMPTY_STRING } from "@/constants";
import { keyboard } from "@/constants/keyboard";
import { useHandleSearch } from "@/hooks/useHandleSearch";

export const TitleSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(EMPTY_STRING);
  const handleSearch = useHandleSearch();

  return (
    <div className="flex flex-col items-center justify-center h-[24.125rem] lg:h-[23rem] md:h-[22.375rem] bg-jumbotron rounded-[1.375rem] lg:rounded-[2.25rem] md:rounded-[2rem] mt-5 md:mt-6 gap-10 px-4 md:px-10">
      <h1 className="text-center font-medium md:font-semibold text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] lg:leading-[2.97rem] md:leading-[2.7rem] leading-[2.25rem] max-w-[52.5rem]">
        {t("home.title")}
      </h1>
      <div className="flex flex-col md:flex-row w-full gap-2 max-w-[57.6875rem]">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("common.inputPlaceholder.search")}
          className="h-11 md:h-14 px-3 py-2 bg-surface-primary rounded-lg border-2 md:border-border-input border-surface-primary outline-none focus:border-border-inputFocus md:flex-1 placeholder:italic placeholder:text-text-quaternary text-text-input font-normal"
          onKeyDown={(event) => event.key === keyboard.enter && handleSearch(searchQuery)}
        />
        <Button
          name="Search"
          handler={() => handleSearch(searchQuery)}
          iconRight={<Search />}
          buttonType={EButtonType.PRIMARY_BLACK}
          height="h-12 md:h-14"
        />
      </div>
    </div>
  );
};
