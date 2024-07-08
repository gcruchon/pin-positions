import { Outlet } from "react-router-dom"
import { AuthProvider } from './AuthProvider';
import { Header } from "./Header";

export const AuthLayout = () => {
    return (
        <AuthProvider>
            <Header />
            <main>
                <Outlet />
            </main>
        </AuthProvider>
    );
}