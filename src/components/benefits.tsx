import { Ticket, Award, ThumbsUp } from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: Ticket,
      title: "Aluguéis flexíveis",
      description:
        "Cancele ou altere a maioria das reservas gratuitamente até 48 horas antes da retirada",
    },
    {
      icon: Award,
      title: "Sem taxas ocultas",
      description: "Saiba exatamente o que você está pagando",
    },
    {
      icon: ThumbsUp,
      title: "Mais de 5 milhões de avaliações",
      description: "Por clientes reais e verificados",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col sm:flex-row md:flex-col gap-4 md:gap-5 items-center sm:items-start md:items-center text-center sm:text-left md:text-center"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 transition-transform hover:scale-110">
                  <benefit.icon className="w-7 h-7 md:w-8 md:h-8 text-[#006ce4]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2 tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
