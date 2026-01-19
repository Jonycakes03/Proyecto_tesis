import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile // Importante para guardar el nombre display
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (name, email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Actualizar el perfil del usuario con su nombre
        await updateProfile(userCredential.user, {
            displayName: name
        });

        // Forzamos actualización del estado local para que la UI refleje el nombre inmediatamente
        // y no haya "race condition" con onAuthStateChanged
        setUser({ ...userCredential.user, displayName: name });

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user: user ? { ...user, name: user.displayName || user.email } : null,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
