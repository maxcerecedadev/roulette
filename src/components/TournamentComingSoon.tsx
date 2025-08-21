// src/components/TournamentComingSoon.tsx

import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const TournamentComingSoon = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <Card className="w-full max-w-md text-center shadow-xl border border-gray-700">
        <CardHeader>
          <h1 className="text-2xl font-bold">Torneos</h1>
        </CardHeader>

        <CardContent>
          <p className="text-lg font-semibold">
            Pronto estaremos habilitando este modo.
          </p>
          <p className="text-sm mt-2 text-gray-400">
            ¡Vuelve a visitarnos pronto!
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            onClick={handleBack}
            variant="secondary"
            className="px-6 py-2"
          >
            Volver al Menú
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
