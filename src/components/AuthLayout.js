import { Outlet } from "react-router"
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