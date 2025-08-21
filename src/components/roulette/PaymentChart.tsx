// src/components/PaymentChart.tsx
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PaymentChart = ({ onClose }: { onClose?: () => void }) => {
  const payments = [
    { type: "Apuesta directa", payout: "35:1" },
    { type: "Apuesta dividida", payout: "17:1" },
    { type: "Apuesta a trío", payout: "11:1" },
    { type: "Apuesta de calle", payout: "11:1" },
    { type: "Apuesta de esquina", payout: "8:1" },
    { type: "Apuesta de línea", payout: "5:1" },
    { type: "Apuesta de columna", payout: "2:1" },
    { type: "Apuesta de docena", payout: "2:1" },
    { type: "Apuesta al par", payout: "1:1" },
  ];

  return (
    <section className="w-full p-6 flex justify-center">
      <Card className="relative w-1/2 min-w-[600px] max-w-6xl">
        {/* Botón de cerrar */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <CardContent className="p-6">
          {/* Título con gradiente */}
          <div className="relative text-center mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50 pointer-events-none"></div>
            <h2 className="relative z-10 text-2xl font-semibold uppercase py-4">
              Tabla de Pagos
            </h2>
          </div>

          {/* Contenido de la tabla de pagos */}
          <div className="flex flex-col gap-3 mt-4 text-lg font-medium w-full">
            {payments.map((payment, index) => (
              <div key={index} className="flex items-center w-full">
                <span className="w-1/3 text-left">{payment.type}</span>
                <div className="flex-grow mx-2 h-px bg-gray-600"></div>
                <span className="w-20 text-right">{payment.payout}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
