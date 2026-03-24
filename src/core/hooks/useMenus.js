import Api from "../services/ApiService";
import { useQuery } from "@tanstack/react-query";
import DataService from "../services/DataService";
import { useEffect, useState } from "react";
import { CNavItem, CNavGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilPuzzle,
    cilSpeedometer,
    cilWallet,
    cilUser,
    cilSettings,
    cilStorage,
    cilCart,
    cilCheckCircle,
    cilChart,
} from '@coreui/icons'

const getIcon = (name) => {
    if (!name) return cilPuzzle;
    const lowerName = name.toLowerCase();
    switch (lowerName) {
        case 'dashboard': return cilSpeedometer;
        case 'gestión ventas': return cilCart;
        case 'gestión inventario': return cilStorage;
        case 'ventas': return cilCart;
        case 'informe': return cilChart;
        case 'inventario': return cilStorage;
        case 'administración': return cilSettings;
        case 'admin': return cilSettings;
        case 'cliente': return cilUser;
        case 'pagos entrantes': return cilWallet;
        case 'pagos totales': return cilWallet;
        case 'servicios en venta': return cilCart;
        case 'validar': return cilCheckCircle;
        default: return cilPuzzle;
    }
}

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
                icon: <CIcon icon={getIcon(item.nombre)} customClassName="lasso-sidebar-icon" />,
                items: (item.submenus || []).map((item2) => {
                    return {
                        component: CNavItem,
                        name: item2.nombre,
                        to: item2.url,
                        icon: <CIcon icon={getIcon(item2.nombre)} customClassName="lasso-sidebar-icon" />,
                    }
                })
            }
        });

        setMenus(format);
    }

    useEffect(() => {
        try {
            const dataStored = DataService.getData("menus");
            if (dataStored) {
                const menusLocalStorage = JSON.parse(dataStored);
                if (menusLocalStorage) {
                    formatMenus(menusLocalStorage);
                } else {
                    refetch();
                }
            } else {
                refetch();
            }
        } catch (error) {
            console.error("Error loading menus from localStorage:", error);
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