// src/LeaveGameDialog.tsx
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./roulette/Button";

interface LeaveGameDialogProps {
    socket: React.MutableRefObject<Socket | null>;
    roomId: string | null;
}

export const LeaveGameDialog = ({ socket, roomId }: LeaveGameDialogProps) => {
    const navigate = useNavigate();

    const handleLeaveAndNavigate = () => {
        if (!socket.current) {
            console.log("El socket no está conectado, navegando sin emitir.");
            navigate("/");
            return;
        }

        if (roomId) {
            try {
                socket.current?.emit("leave-room", { roomId: roomId }, (ack?: any) => {
                    console.log("leave-room ack", ack);
                });
            } catch (err) {
                console.warn("Error emitiendo leave-room:", err);
            }
        }

        try {
            socket.current.removeAllListeners();
        } catch {
            try {
                socket.current?.off();
            } catch {}
        }
        try {
            socket.current.disconnect();
        } catch (err) {
            console.warn("Error al desconectar socket:", err);
        }
        socket.current = null;
        console.log("✅ Socket limpiado y desconectado.");
        navigate("/");
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button label="Leave" imageURL={"/res/ButtonExit.svg"} />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres salir?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Se perderá la conexión con el servidor y cualquier apuesta pendiente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeaveAndNavigate}>Salir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};