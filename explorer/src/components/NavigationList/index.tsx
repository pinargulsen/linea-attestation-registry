import { Dispatch, Fragment, SetStateAction } from "react";

import { NavLink } from "@/components/NavLink";
import { DEFAULT_ROUTES } from "@/constants/components";

import { ListItemWithSubmenu } from "./components/ListItemWithSubmenu";

export const NavigationList: React.FC<{ setIsOpened?: Dispatch<SetStateAction<boolean>> }> = ({ setIsOpened }) => {
  return (
    <div className="flex flex-col justify-center ms-8 gap-6 self-stretch sm:ms-20 xl:ms-0 xl:items-center xl:flex-row xl:justify-start">
      {DEFAULT_ROUTES.map(({ name, route, submenu }) => (
        <Fragment key={name}>
          {route ? (
            <NavLink
              onClick={() => setIsOpened?.(false)}
              to={route}
              className={({ isActive }) =>
                `${
                  isActive ? "text-text-primary" : "text-text-tertiary"
                } text-xl xl:text-base font-medium hover:text-text-primary transition`
              }
            >
              {name}
            </NavLink>
          ) : (
            submenu && <ListItemWithSubmenu name={name} submenu={submenu} />
          )}
        </Fragment>
      ))}
    </div>
  );
};
