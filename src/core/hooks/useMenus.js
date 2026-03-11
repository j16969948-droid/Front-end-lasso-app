import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";
import DataService from "../services/DataService";
import { useEffect, useState } from "react";
import { CNavItem, CNavGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPuzzle,
} from '@coreui/icons'
const getMenusUser = async () => {
    const { data } = await Api.get("api/v1/sidebar");
    return data;
};
export const useMenusUser = () => {
    const [menus, setMenus] = useState([]);

    const { data, refetch, isLoading } = useQuery({
        queryKey: ["menusUsuario"],
        queryFn: getMenusUser,
        enabled: false,
    });

    const formatMenus = (data) => {
        DataService.saveData("menus", JSON.stringify(data));
        const format = data.map((item) => {
            return {
                component: CNavGroup,
                name: item.nombre,
                to: item.url,
                icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
                items: item.submenus.map((item2) => {
                    return {
                        component: CNavItem,
                        name: item2.nombre,
                        to: item2.url,
                    }
                })
            }
        });
                
        setMenus(format);
    }

    useEffect(() => {
        const menusLocalStorage = JSON.parse(DataService.getData("menus"));
        if (menusLocalStorage) {
            formatMenus(menusLocalStorage);
        } else {
            refetch();
        }
    }, []);

    useEffect(() => {
        if (data) formatMenus(data);
    }, [data]);

    return {
        menus,
        isLoading,
    }
};