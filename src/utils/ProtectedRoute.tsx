import { useContext, type PropsWithChildren } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router-dom"


export const ProtectedRoute = ({children}: PropsWithChildren) => {

    const user = useContext(AuthContext)
    if(!user?.user) return <Navigate to="/login" />
    
    return children;
}