
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = '@trc_app_theme';

const COLORES = {
    claro: {
        modo: 'light',
        primary: '#D31A24',
        background: '#F7F7F7',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        text: '#171717',
        secondaryText: '#6B7280',
        border: '#E5E7EB',
        input: '#F3F4F6',
        tabBar: '#FFFFFF',
        statusBar: 'dark',
    },

    oscuro: {
        modo: 'dark',
        primary: '#D31A24',
        background: '#121212',
        surface: '#1C1C1E',
        card: '#1C1C1E',
        text: '#FFFFFF',
        secondaryText: '#A1A1AA',
        border: '#333333',
        input: '#2A2A2A',
        tabBar: '#1C1C1E',
        statusBar: 'light',
    },
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [loadingTheme, setLoadingTheme] = useState(true);

    useEffect(() => {
        const cargarTema = async () => {
            try {
                const temaGuardado = await AsyncStorage.getItem(
                    THEME_STORAGE_KEY
                );

                setIsDark(temaGuardado === 'dark');
            } catch (error) {
                console.log('Error al cargar el tema:', error);
            } finally {
                setLoadingTheme(false);
            }
        };

        cargarTema();
    }, []);

    const toggleTheme = async () => {
        const nuevoTema = !isDark;

        setIsDark(nuevoTema);

        try {
            await AsyncStorage.setItem(
                THEME_STORAGE_KEY,
                nuevoTema ? 'dark' : 'light'
            );
        } catch (error) {
            console.log('Error al guardar el tema:', error);
        }
    };

    const theme = isDark ? COLORES.oscuro : COLORES.claro;

    return (
        <ThemeContext.Provider
            value={{
                isDark,
                theme,
                toggleTheme,
                loadingTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            'useTheme debe utilizarse dentro de ThemeProvider'
        );
    }

    return context;
}
